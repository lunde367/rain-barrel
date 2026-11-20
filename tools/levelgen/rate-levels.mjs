// Prints a difficulty report for every level in the game:  node tools/levelgen/rate-levels.mjs
import { LEVELS, WORLDS } from '../../js/data/levels.js';
import { rate } from './rate.mjs';
console.log('#  World           Level             Score  Pieces Decoys Routes Traps Best  Mechanics');
for (const L of LEVELS){ if (L.lab) continue; const r = rate(L);
  console.log(String(L.gi+1).padEnd(3), WORLDS[L.wi].name.padEnd(15), L.name.padEnd(17), String(r.score).padStart(5),
    String(r.pieces).padStart(6), String(r.decoys).padStart(6), String(r.routes).padStart(6), String(r.traps).padStart(5), String(r.min).padStart(5)+' ', r.mechanics.join(', ')); }
