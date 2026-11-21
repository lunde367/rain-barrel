// Difficulty rater: turns a level into numbers that say how hard it is, and one overall score.
// The weights are a starting point, tuned so the 16 hand-made levels come out in a sensible order.
// Change them freely as playtesting shows what really makes a level hard.
import { parse } from '../../web/js/engine/flow.js';
import { solve, explore, distinct } from './solver.mjs';

// The main measure is EFFORT: how many partial routes a careful player would have to try before
// finding the answer, if they never spill more water than the best answer does. A tiny number means
// the route can just be followed; a big one means real thinking. DEAD ENDS are complete routes that
// look fine but leave a plant dry. (Checked against the hand-made levels: First Sip needs 5 tries,
// Long Way Round 31, Last Drops 1813.)
export const WEIGHTS = {
  effort: 3,       // per doubling of the routes a careful player would try
  deadEnds: 2,     // per doubling of complete-looking routes that fail
  mechanic: 1,     // per mechanic in play (locked, sun-baked, cows, hills, pumps, limited barrel, cactus, tray, linked)
  plants: 1,       // per extra plant
  answers: -2,     // per doubling of different best answers (more answers = easier)
};

export function rate(level, { effortLimit = 60000, traps:countTraps = false } = {}){
  const S = parse(level), sol = solve(level);
  if (!sol.solvable) return { solvable:false };
  const capped = S.cap !== Infinity;
  const careful = explore(level, { bound:sol.min, maxLeaks:sol.best.leaks, nodeLimit:effortLimit });
  const effort = careful.nodes, deadEnds = distinct(careful.outcomes.filter(o => !o.all)).length;
  // routes that water everything without the barrel limit but cost more (tempting wrong answers)
  // (slow, so only counted for the report)
  const traps = countTraps ? distinct(explore(level, { noCap:true, bound:sol.min + 6, nodeLimit:effortLimit })
    .outcomes.filter(o => o.all && o.water > sol.min)).length : null;
  const pipes = S.tiles.filter(t => t.type==='pipe'), turnable = pipes.filter(t => !t.locked);
  const onRoute = new Set(sol.best.key.split(',').map(x => +x.split(':')[0]));
  const decoys = turnable.filter(t => !onRoute.has(t.i)).length;
  const mech = {
    cactus: S.tiles.some(t => t.type==='cactus'), tray: S.tiles.some(t => t.slot), linked: pipes.some(t => t.link),
    locked: pipes.some(t => t.locked), hot: S.tiles.some(t => t.hot), cows: S.tiles.some(t => t.type==='cow'),
    hills: S.tiles.some(t => t.h > 0), pumps: S.tiles.some(t => t.pump), cap: capped,
  };
  const w = WEIGHTS, lg = x => Math.log2(1 + x);
  const score = w.effort*Math.log2(effort) + w.deadEnds*lg(deadEnds)
    + w.mechanic*Object.values(mech).filter(Boolean).length + w.plants*(S.plants-1) + w.answers*Math.log2(sol.optimal);
  return { solvable:true, score:Math.round(score*10)/10, min:sol.min, optimal:sol.optimal, effort, deadEnds, traps,
    pieces:turnable.length, decoys, plants:S.plants, size:`${S.W}x${S.H}`,
    mechanics:Object.keys(mech).filter(k => mech[k]), truncated:sol.truncated, effortCapped:careful.truncated, rows:sol.rows, extra:sol.extra };
}
