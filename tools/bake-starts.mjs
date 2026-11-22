// Works out every real level's starting board (the scramble) and its par (fewest taps to win),
// and saves them to web/js/data/starts.js so the game doesn't have to search when a level opens.
// Run after changing any level:  node tools/bake-starts.mjs
import { writeFileSync } from 'node:fs';
import { LEVELS } from '../web/js/data/levels.js';
import { prepare, seedOf } from '../web/js/engine/game.js';
import { fewestMoves } from '../web/js/engine/par.js';
const out = {}; let slow = 0;
for (const L of LEVELS){
  if (L.lab) continue;
  const t0 = Date.now(), S = prepare({ ...L, start:undefined }, seedOf(L)), ms = Date.now() - t0;
  if (ms > 500) slow++;
  // the game's own search gives up on huge boards; here there's time to search until it's exact
  const exact = fewestMoves(S, { nodeLimit:5e6 });
  if (exact === null) console.log(`  ! ${L.name}: par is an estimate (board too big to search)`); else S.par = exact;
  out[L.id] = { par:S.par, rot:S.tiles.map(t => (t.type==='pipe' && !t.locked) ? ((t.rot % 4) + 4) % 4 : null),
    tray:S.tray.map(p => [p.base, p.rot, p.home]) };
  console.log(`${L.W.name.padEnd(16)} ${String(L.li+1).padStart(2)} ${L.name.padEnd(18)} par ${String(S.par).padStart(3)}  ${ms} ms`);
}
writeFileSync(new URL('../web/js/data/starts.js', import.meta.url),
`// Made by tools/bake-starts.mjs: each level's scrambled starting board and its par (the fewest taps
// that win from that board). Don't edit by hand; run the tool again after changing levels.
// rot = each tile's starting turn (null for tiles that don't turn); tray = [piece, turn, home slot].
export const STARTS = ${JSON.stringify(out)};
`);
console.log(`\nBaked ${Object.keys(out).length} levels (${slow} took over half a second to search).`);
