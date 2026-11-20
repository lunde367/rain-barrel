// Difficulty rater: turns a level into numbers that say how hard it is, and one overall score.
// The weights are a starting point, tuned so the 16 hand-made levels come out in a sensible order.
// Change them freely as playtesting shows what really makes a level hard.
import { parse } from '../../js/engine/flow.js';
import { solve, explore, distinct } from './solver.mjs';

export const WEIGHTS = {
  search: 1.2,     // per doubling of the routes a player could try (how big the maze of choices is)
  pieces: .35,     // per piece you can turn
  decoys: .25,     // per piece that isn't part of the answer
  traps: 1.5,      // per doubling of routes that work but waste water (tempting wrong answers)
  mechanic: 1,     // per mechanic in play (locked, sun-baked, cows, hills, pumps, limited barrel)
  plants: 1,       // per extra plant
  sources: .7,     // per extra water source
  answers: -1.5,   // per doubling of different best answers (more answers = easier)
};

export function rate(level, { margin = 8 } = {}){
  const S = parse(level), sol = solve(level);
  if (!sol.solvable) return { solvable:false };
  const capped = S.cap !== Infinity;
  // Routes that water every plant without the barrel limit, but cost more than the best one.
  const loose = explore(level, { noCap:true, bound:sol.min + margin });
  const wins = distinct(loose.outcomes.filter(o => o.all));
  const traps = wins.filter(o => o.water > sol.min).length;
  const routes = distinct(loose.outcomes).length;
  const pipes = S.tiles.filter(t => t.type==='pipe'), turnable = pipes.filter(t => !t.locked);
  const onRoute = new Set(sol.best.key.split(',').map(x => +x.split(':')[0]));
  const decoys = turnable.filter(t => !onRoute.has(t.i)).length;
  const mech = {
    locked: pipes.some(t => t.locked), hot: S.tiles.some(t => t.hot), cows: S.tiles.some(t => t.type==='cow'),
    hills: S.tiles.some(t => t.h > 0), pumps: S.tiles.some(t => t.pump), cap: capped,
  };
  const sources = S.tiles.filter(t => t.type==='src').length;
  const w = WEIGHTS, lg = x => Math.log2(1 + x);
  const score = w.search*lg(routes) + w.pieces*turnable.length + w.decoys*decoys + w.traps*lg(traps)
    + w.mechanic*Object.values(mech).filter(Boolean).length + w.plants*(S.plants-1) + w.sources*(sources-1)
    + w.answers*Math.log2(sol.optimal);
  return { solvable:true, score:Math.round(score*10)/10, min:sol.min, optimal:sol.optimal, routes, traps,
    pieces:turnable.length, decoys, plants:S.plants, sources, size:`${S.W}x${S.H}`,
    mechanics:Object.keys(mech).filter(k => mech[k]), truncated:loose.truncated || sol.truncated, rows:sol.rows };
}
