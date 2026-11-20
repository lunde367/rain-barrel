// One level being played: turning pieces, undo, hints and the win check.
// Like Carrot Patch's engine, it never touches the screen or sound directly: it emits events.
import { emit } from '../../kit/js/events.js';
import { LEVELS } from '../data/levels.js';
import { parse, flow, needed, mulberry32 } from './flow.js';

export const G = { LV:null, S:null };

export function startLevel(gi){
  const LV = LEVELS[gi], S = parse(LV);
  // The level is written solved: measure it before scrambling.
  const sol = flow(S);
  S.budget = sol.water; S.solOrder = sol.order;
  const rnd = mulberry32(gi*9973+7);
  for (let tries=0; tries<60; tries++){
    S.tiles.forEach(t => { if (t.type==='pipe' && !t.locked) t.rot = Math.floor(rnd()*4); });
    if (flow(S).watered.size < S.plants) break;
  }
  S.par = S.solOrder.reduce((a,i) => { const t=S.tiles[i]; return a + (t.locked ? 0 : needed(t)); }, 0) + 3;
  S.taps = 0; S.history = []; S.done = false; S.hints = 0;
  S.flow = flow(S);
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
  if (f.ranOut && !prev.ranOut) emit('dry');
  if (f.blocked.length > prev.blocked.length) emit('uphill');
  emit('changed');
  if (!S.done && f.watered.size === S.plants){
    S.done = true;
    emit('win', { gi:G.LV.gi, stars:starsFor(S), water:f.water, budget:S.budget, taps:S.taps, par:S.par, leaks:f.leaks.length, capped:S.cap!==Infinity });
  }
}

// Tap a piece: it turns a quarter clockwise.
export function turn(i){
  const S = G.S; if (!S || S.done) return false;
  const T = S.tiles[i]; if (!T || T.type!=='pipe') return false;
  if (T.locked){ emit('locked', i); return false; }
  T.rot++; S.taps++; S.history.push(i);
  emit('turn', i); recompute(); return true;
}

export function undo(){
  const S = G.S; if (!S || S.done || !S.history.length) return false;
  const i = S.history.pop(); S.tiles[i].rot--; S.taps--;
  emit('undo', i); recompute(); return true;
}

// A hint turns the first wrong piece on the main route the right way. Returns its index, or -1.
export function applyHint(){
  const S = G.S; if (!S || S.done) return -1;
  const i = S.solOrder.find(i => { const t=S.tiles[i]; return !t.locked && needed(t) > 0; });
  if (i === undefined) return -1;
  const T = S.tiles[i], k = needed(T);
  for (let n=0; n<k; n++){ T.rot++; S.taps++; S.history.push(i); }
  S.hints++;
  emit('hint', i); recompute(); return i;
}

// Test mode: put every piece the right way.
export function solveAll(){
  const S = G.S; if (!S || S.done) return;
  S.tiles.forEach(t => { if (t.type==='pipe' && !t.locked) t.rot += needed(t); });
  recompute();
}
