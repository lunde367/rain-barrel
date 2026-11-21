// Level solver: finds the best way to water every plant, and how many tempting wrong ways there are.
//
// Instead of trying every rotation of every piece (4^pieces, far too many on big boards), it follows
// the water: it only decides a piece's direction once water could reach it. Pieces the water never
// touches don't change anything, so they're never tried. Uses the game's own water rules
// (js/engine/flow.js), so what the solver sees is exactly what the player sees.
//
// It understands every mechanic: linked pieces are decided together, and an empty slot can stay
// empty or take any piece still left in the tray.
import { parse, flow, solved, rotMask, TOK } from '../../js/engine/flow.js';

// The directions a piece can face that actually look different (a straight piece has 2, a cross 1).
export function orientations(base){
  const seen = new Set(), out = [];
  for (let k=0; k<4; k++){ const m = rotMask(base, k); if (!seen.has(m)){ seen.add(m); out.push(k); } }
  return out;
}

// Walk every way the water could spread. Each "outcome" is one possible final route.
//   bound:  skip routes that already use more than this many drops (water only ever goes up as pieces are decided)
//   noCap:  ignore the barrel's limit (to find routes that would work if the barrel were bigger: traps)
//   best:   branch-and-bound: tighten `bound` whenever a cheaper winning route is found
export function explore(level, { bound = Infinity, noCap = false, best = false, nodeLimit = 400000 } = {}){
  const S = parse(level);
  if (noCap) S.cap = Infinity;
  const tray = {};
  for (const t of S.tiles){
    if (t.tray) tray[t.base] = (tray[t.base]||0) + 1;
    if (t.slot){ t.type = 'pipe'; t.base = 0; t.isSlot = true; }   // undecided slot
  }
  for (const b of S.extra) tray[b] = (tray[b]||0) + 1;
  for (const t of S.tiles) if (t.type==='pipe') t.rot = t.locked ? 0 : null;
  const groups = {}; S.tiles.forEach(t => { if (t.link && t.type==='pipe') (groups[t.link] ??= []).push(t); });

  const outcomes = []; let nodes = 0, truncated = false;
  const rec = () => {
    if (++nodes > nodeLimit){ truncated = true; return; }
    const f = flow(S);
    if (f.water > bound || f.soaked.size) return;   // a wet cactus can never be undone by deciding more pieces
    if (!f.frontier.size){
      const all = solved(S, f);
      // routes count as the same when the same channels carry water, facing the same way
      const key = [...f.wet].sort((a,b) => a-b).map(i => i+':'+rotMask(S.tiles[i].base, S.tiles[i].rot)).join(',');
      outcomes.push({ water:f.water, all, ranOut:f.ranOut, leaks:f.leaks.length, wet:f.wet.size, key,
        state: S.tiles.map(t => t.type==='pipe' && t.rot!=null ? { b:t.base, k:t.rot } : null) });
      if (best && all && f.water < bound) bound = f.water;
      return;
    }
    const t = S.tiles[Math.min(...f.frontier)];
    if (t.isSlot){
      t.type = 'grass'; rec(); t.type = 'pipe';                     // leave the slot empty
      for (const b of Object.keys(tray).map(Number)){ if (!tray[b] || truncated) continue;
        tray[b]--; t.base = b;
        for (const k of orientations(b)){ t.rot = k; rec(); if (truncated) break; }
        tray[b]++; }
      t.base = 0; t.rot = null; return;
    }
    const group = t.link ? groups[t.link] : [t];
    const seen = new Set();
    for (let k=0; k<4 && !truncated; k++){
      const sig = group.map(x => rotMask(x.base, k)).join(','); if (seen.has(sig)) continue; seen.add(sig);
      group.forEach(x => { x.rot = k; }); rec();
    }
    group.forEach(x => { x.rot = null; });
  };
  rec();
  return { S, outcomes, nodes, truncated, tray };
}

export function solve(level, opts = {}){
  const { S, outcomes, nodes, truncated, tray } = explore(level, { best:true, ...opts });
  const wins = outcomes.filter(o => o.all);
  if (!wins.length) return { solvable:false, nodes, truncated };
  const min = Math.min(...wins.map(o => o.water));
  const optimal = distinct(wins.filter(o => o.water === min));
  return { solvable:true, min, optimal:optimal.length, best:optimal[0], ...toLevel(level, S, optimal[0].state, tray), nodes, truncated };
}

// Keep one outcome per distinct route.
export function distinct(list){ const seen = new Set(); return list.filter(o => !seen.has(o.key) && seen.add(o.key)); }

// Rewrite a level so every piece faces the way it does in a given outcome, with tray pieces in the
// slots that outcome used. Pieces the water never reaches keep their original direction; tray pieces
// the outcome didn't use go to `extra`.
const TOKEN = Object.fromEntries(Object.entries(TOK).map(([k,v]) => [v,k]));
function toLevel(level, S, state, tray){
  const left = { ...tray };
  const grid = level.rows.map(r => r.trim().split(/\s+/));
  const rows = grid.map((row, r) => row.map((tok, c) => {
    const t = S.tiles[r*S.W + c], st = state[t.i];
    const mods = tok.slice(1).replace('+', '');
    if (t.isSlot){
      if (!st) return '_' + mods;
      left[st.b]--; return TOKEN[rotMask(st.b, st.k)] + '+' + mods;
    }
    if (t.type!=='pipe' || !st || t.locked) return tok;
    return TOKEN[rotMask(t.base, st.k)] + mods;
  }).join(' '));
  const extra = Object.entries(left).flatMap(([b,n]) => Array(Math.max(0,n)).fill(TOKEN[b]));
  return { rows, extra };
}
