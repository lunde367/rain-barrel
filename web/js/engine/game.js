// One level being played: turning pieces, placing tray pieces, undo, hints and the win check.
// Like Carrot Patch's engine, it never touches the screen or sound directly: it emits events.
import { emit } from '../../kit/js/events.js';
import { LEVELS } from '../data/levels.js';
import { parse, flow, solved, rotMask, mulberry32 } from './flow.js';
import { fewestMoves } from './par.js';

export const G = { LV:null, S:null };

// Turns needed to bring a piece (or a whole linked group) back to its solved direction.
const fits = (t, k) => rotMask(t.base, t.rot + k) === rotMask(t.solBase ?? t.base, 0);
export const groupOf = (S, t) => t.link ? S.tiles.filter(x => x.link===t.link && x.type==='pipe') : [t];
export function needed(S, t){ const g = groupOf(S, t); for (let k=0; k<4; k++) if (g.every(x => fits(x, k))) return k; return 0; }

// Build a level ready to play: measure the solution, move tray pieces into the tray, scramble.
// Used by the game and by the level tools, so both see exactly the same starting board.
export function prepare(LV, seed){
  const S = parse(LV);
  S.tiles.forEach(t => { if (t.type==='pipe') t.solBase = t.base; });
  const sol = flow(S);
  S.budget = sol.water; S.solOrder = sol.order;
  const rnd = mulberry32(seed);
  // tray: pieces marked + start in the tray; their tiles become empty slots
  S.tray = [];
  for (const t of S.tiles) if (t.tray){ S.tray.push({ base:t.base, rot:0, used:false, home:t.i }); t.type='slot'; t.base=0; }
  for (const b of S.extra) S.tray.push({ base:b, rot:0, used:false, home:-1 });
  for (let tries=0; tries<60; tries++){
    const groups = {};
    S.tiles.forEach(t => { if (t.type!=='pipe' || t.locked) return;
      if (t.link){ groups[t.link] ??= Math.floor(rnd()*4); t.rot = groups[t.link]; } else t.rot = Math.floor(rnd()*4); });
    S.tray.forEach(p => { p.rot = Math.floor(rnd()*4); });
    if (!solved(S, flow(S))) break;
  }
  for (let i=S.tray.length-1; i>0; i--){ const j = Math.floor(rnd()*(i+1)); [S.tray[i], S.tray[j]] = [S.tray[j], S.tray[i]]; }
  // fallback par: turns to fix the written solution's pieces (once per linked group), plus placing and turning tray pieces
  const counted = new Set(); let par = 0;
  for (const i of S.solOrder){ const t = S.tiles[i];
    if (t.type==='slot'){ const p = S.tray.find(p => p.home===i); par += 1 + [0,1,2,3].find(k => rotMask(p.base, p.rot+k)===p.base); continue; }
    if (t.locked || (t.link && counted.has(t.link))) continue; if (t.link) counted.add(t.link); par += needed(S, t); }
  // Par is the fewest taps that win from this exact starting board. The count above (fixing the
  // written solution) is only a fallback for boards too big to search fully.
  const fewest = fewestMoves(S);
  S.par = fewest ?? par;
  S.taps = 0; S.history = []; S.done = false; S.hints = 0;
  S.flow = flow(S);
  return S;
}

export function startLevel(gi){
  const LV = LEVELS[gi], S = prepare(LV, gi*9973+7);
  G.LV = LV; G.S = S;
  emit('levelStart', LV);
  return S;
}

export const starsFor = S => 1 + (S.flow.water <= S.budget ? 1 : 0) + (S.taps <= S.par ? 1 : 0);

function recompute(){
  const S = G.S, prev = S.flow, f = flow(S);
  S.flow = f;
  if (f.wet.size > prev.wet.size) emit('flow', f.wet.size - prev.wet.size);
  if ([...f.watered].some(i => !prev.watered.has(i))) emit('bloom');
  if (f.drank.size > prev.drank.size) emit('moo');
  if (f.leaks.length > prev.leaks.length) emit('leak');
  if (f.soaked.size > prev.soaked.size) emit('soaked');
  if (f.ranOut && !prev.ranOut) emit('dry');
  if (f.blocked.length > prev.blocked.length) emit('uphill');
  emit('changed');
  if (!S.done && solved(S, f)){
    S.done = true;
    emit('win', { gi:G.LV.gi, stars:starsFor(S), water:f.water, budget:S.budget, taps:S.taps, par:S.par, leaks:f.leaks.length, capped:S.cap!==Infinity });
  }
}

const spin = (S, t, d) => groupOf(S, t).forEach(x => { x.rot += d; });

// Tap a piece: it (and every piece linked to it) turns a quarter clockwise.
export function turn(i){
  const S = G.S; if (!S || S.done) return false;
  const T = S.tiles[i]; if (!T || T.type!=='pipe') return false;
  if (T.locked){ emit('locked', i); return false; }
  spin(S, T, 1); S.taps++; S.history.push({ t:'turn', i });
  emit('turn', i); recompute(); return true;
}

// Put tray piece k on empty slot i.
export function place(k, i){
  const S = G.S; if (!S || S.done) return false;
  const T = S.tiles[i], p = S.tray[k]; if (!T || T.type!=='slot' || !p || p.used) return false;
  T.type = 'pipe'; T.base = p.base; T.rot = p.rot; T.vis = null; T.from = k; p.used = true;
  S.taps++; S.history.push({ t:'place', i, k });
  emit('place', i); recompute(); return true;
}
// Take a placed piece back to the tray (keeps the direction it was turned to).
export function pickUp(i, record = true){
  const S = G.S; if (!S || S.done) return false;
  const T = S.tiles[i]; if (!T || T.from==null) return false;
  const p = S.tray[T.from]; p.used = false; p.rot = T.rot;
  if (record){ S.taps++; S.history.push({ t:'pick', i, k:T.from }); }
  T.type = 'slot'; T.base = 0; T.rot = 0; T.from = null;
  emit('pickup', i); recompute(); return true;
}

export function undo(){
  const S = G.S; if (!S || S.done || !S.history.length) return false;
  const h = S.history.pop(), T = S.tiles[h.i];
  if (h.t==='turn') spin(S, T, -1);
  else if (h.t==='place'){ const p = S.tray[h.k]; p.used = false; p.rot = T.rot; T.type='slot'; T.base=0; T.rot=0; T.from=null; }
  else if (h.t==='pick'){ const p = S.tray[h.k]; T.type='pipe'; T.base=p.base; T.rot=p.rot; T.from=h.k; T.vis=null; p.used=true; }
  S.taps--;
  emit('undo', h.i); recompute(); return true;
}

// A hint fixes the first wrong spot on the main route: places the right tray piece, or turns
// a piece (or linked group) the right way. Returns the tile index, or -1.
export function applyHint(){
  const S = G.S; if (!S || S.done) return -1;
  for (const i of S.solOrder){
    const t = S.tiles[i];
    const want = t.solBase;
    if (t.slot && (t.type==='slot' || t.base!==want)){
      if (t.type==='pipe') pickUp(i, false);
      const k = S.tray.findIndex(p => !p.used && p.base===want); if (k < 0) continue;
      S.tray[k].rot = 0;   // a hint places it already turned the right way
      t.type='pipe'; t.base=want; t.rot=0; t.vis=null; t.from=k; S.tray[k].used=true; S.taps++; S.history.push({ t:'place', i, k });
      S.hints++; emit('hint', i); recompute(); return i;
    }
    if (t.type!=='pipe' || t.locked) continue;
    const k = needed(S, t); if (!k) continue;
    for (let n=0; n<k; n++){ spin(S, t, 1); S.taps++; S.history.push({ t:'turn', i }); }
    S.hints++; emit('hint', i); recompute(); return i;
  }
  return -1;
}

// Test mode: put every piece where it belongs, the right way round.
export function solveAll(){
  const S = G.S; if (!S || S.done) return;
  for (const t of S.tiles) if (t.slot && t.solBase==null && t.type==='pipe') pickUp(t.i, false);   // decoys off empty slots
  for (const t of S.tiles) if (t.slot && t.solBase!=null && (t.type==='slot' || t.base!==t.solBase)){
    if (t.type==='pipe') pickUp(t.i, false);
    const k = S.tray.findIndex(p => !p.used && p.base===t.solBase); if (k<0) continue;
    t.type='pipe'; t.base=t.solBase; t.rot=0; t.vis=null; t.from=k; S.tray[k].used=true;
  }
  const done = new Set();
  for (const t of S.tiles){ if (t.type!=='pipe' || t.locked || done.has(t.link||t.i)) continue; done.add(t.link||t.i); spin(S, t, needed(S, t)); }
  recompute();
}
