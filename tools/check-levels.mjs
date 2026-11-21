// Checks every level: solvable as written, and not already solved after the game scrambles it.
//   node tools/check-levels.mjs
import { LEVELS } from '../web/js/data/levels.js';
import { parse, flow, solved } from '../web/js/engine/flow.js';
import { prepare } from '../web/js/engine/game.js';
let bad = 0;
for (const L of LEVELS){
  const S0 = parse(L), sol = flow(S0);
  const S = prepare(L, L.gi*9973+7);
  // (the barrel may run dry on a side branch after every plant has its water; that still counts)
  const ok = solved(S0, sol) && !solved(S, S.flow);
  if (!ok) bad++;
  console.log(L.gi+1, L.name, ok ? 'ok' : 'PROBLEM', 'water', sol.water, 'cap', S0.cap);
}
console.log(bad ? bad+' problems' : 'all levels ok');
