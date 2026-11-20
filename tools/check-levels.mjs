import { LEVELS } from '../js/data/levels.js';
import { parse, flow, mulberry32 } from '../js/engine/flow.js';
let bad=0;
for (const L of LEVELS){ const s=parse(L), sol=flow(s);
  const rnd=mulberry32(L.gi*9973+7); for(let t=0;t<60;t++){ s.tiles.forEach(t=>{ if(t.type==='pipe'&&!t.locked) t.rot=Math.floor(rnd()*4); }); if(flow(s).watered.size<s.plants) break; }
  const sc=flow(s); const ok = sol.watered.size===s.plants && !sol.ranOut && sc.watered.size<s.plants;
  if(!ok) bad++; console.log(L.gi+1, L.name, ok?'ok':'PROBLEM', 'water', sol.water, 'cap', s.cap);
}
console.log(bad? bad+' problems':'all levels ok');
