// Level solver: finds the best way to water every plant, and how many tempting wrong ways there are.
//
// Instead of trying every rotation of every piece (4^pieces, far too many on big boards), it follows
// the water: it only decides a piece's direction once water could reach it. Pieces the water never
// touches don't change anything, so they're never tried. Uses the game's own water rules
// (js/engine/flow.js), so what the solver sees is exactly what the player sees.
import { parse, flow, rotMask } from '../../js/engine/flow.js';

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
  for (const t of S.tiles) if (t.type==='pipe') t.rot = t.locked ? 0 : null;
  const outcomes = []; let nodes = 0, truncated = false;
  const rec = () => {
    if (++nodes > nodeLimit){ truncated = true; return; }
    const f = flow(S);
    if (f.water > bound) return;
    if (!f.frontier.size){
      const all = f.watered.size === S.plants;
      // routes count as the same when the same channels carry water, facing the same way
      const key = [...f.wet].sort((a,b) => a-b).map(i => i+':'+rotMask(S.tiles[i].base, S.tiles[i].rot)).join(',');
      outcomes.push({ water:f.water, all, ranOut:f.ranOut, leaks:f.leaks.length, wet:f.wet.size, key,
        rots: S.tiles.map(t => t.type==='pipe' ? t.rot : null) });
      if (best && all && f.water < bound) bound = f.water;
      return;
    }
    const t = S.tiles[Math.min(...f.frontier)];
    for (const k of orientations(t.base)){ t.rot = k; rec(); if (truncated) break; }
    t.rot = null;
  };
  rec();
  return { S, outcomes, nodes, truncated };
}

// The cheapest way to water every plant, as solved level rows (the format js/data/levels.js uses).
const TOKEN = { 10:'─', 5:'│', 3:'└', 6:'┌', 12:'┐', 9:'┘', 7:'├', 13:'┤', 14:'┬', 11:'┴', 15:'┼' };
export function solve(level, opts = {}){
  const { S, outcomes, nodes, truncated } = explore(level, { best:true, ...opts });
  const wins = outcomes.filter(o => o.all);
  if (!wins.length) return { solvable:false, nodes, truncated };
  const min = Math.min(...wins.map(o => o.water));
  const optimal = distinct(wins.filter(o => o.water === min));
  return { solvable:true, min, optimal:optimal.length, best:optimal[0], rows:toRows(level, S, optimal[0].rots), nodes, truncated };
}

// Rewrite a level's rows so every piece faces the way it does in a given outcome
// (pieces the water never reaches keep their original direction).
export function toRows(level, S, rots){
  const grid = level.rows.map(r => r.trim().split(/\s+/));
  return grid.map((row, r) => row.map((tok, c) => {
    const t = S.tiles[r*S.W + c];
    if (t.type!=='pipe' || rots[t.i]==null || t.locked) return tok;
    return TOKEN[rotMask(t.base, rots[t.i])] + tok.slice(1);
  }).join(' '));
}

// Keep one outcome per distinct route.
export function distinct(list){ const seen = new Set(); return list.filter(o => !seen.has(o.key) && seen.add(o.key)); }
