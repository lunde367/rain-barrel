// Par: the fewest taps that win the level from the board exactly as the player gets it.
//
// A search that follows the water (like the level tools' solver): a piece is only decided once water
// could reach it, so pieces the water never touches cost nothing and are never tried. Each choice
// costs what it would cost the player: turning a piece d quarter-turns costs d taps (a linked group
// turns together, so it costs d once), and placing a tray piece costs 1 tap plus its turns.
// Branch-and-bound keeps it fast: any branch already costing as much as the best win so far is dropped.
import { flow, solved, rotMask } from './flow.js';

export function fewestMoves(S, { nodeLimit = 250000 } = {}){
  const tiles = S.tiles, saved = tiles.map(t => ({ type:t.type, base:t.base, rot:t.rot }));
  const trayUsed = (S.tray || []).map(p => p.used);
  const start = new Map(), groups = {};
  for (const t of tiles){
    if (t.type==='pipe' && !t.locked){ start.set(t.i, t.rot); t.rot = null; if (t.link) (groups[t.link] ??= []).push(t); }
    else if (t.type==='slot'){ t.type='pipe'; t.base=0; t.rot=null; t.isSlot=true; }
  }
  let best = Infinity, nodes = 0, cut = false;
  const rec = cost => {
    if (cost >= best) return;
    if (++nodes > nodeLimit){ cut = true; return; }
    const f = flow(S);
    if (f.soaked.size) return;
    if (!f.frontier.size){ if (solved(S, f)) best = cost; return; }
    const t = tiles[Math.min(...f.frontier)];
    if (t.isSlot){
      t.type='slot'; rec(cost); t.type='pipe';                       // leave it empty
      (S.tray || []).forEach((p, j) => { if (p.used || cut) return;
        p.used = true; t.base = p.base;
        const seen = new Set();
        for (let d=0; d<4 && !cut; d++){ const m = rotMask(p.base, p.rot+d); if (seen.has(m)) continue; seen.add(m); t.rot = p.rot+d; rec(cost+1+d); }
        p.used = false; });
      t.base = 0; t.rot = null; return;
    }
    const group = t.link ? groups[t.link] : [t], seen = new Set();
    for (let d=0; d<4 && !cut; d++){
      const sig = group.map(x => rotMask(x.base, start.get(x.i)+d)).join(','); if (seen.has(sig)) continue; seen.add(sig);
      group.forEach(x => { x.rot = start.get(x.i)+d; }); rec(cost+d);
    }
    group.forEach(x => { x.rot = null; });
  };
  rec(0);
  tiles.forEach((t, i) => { Object.assign(t, saved[i]); delete t.isSlot; });
  (S.tray || []).forEach((p, j) => { p.used = trayUsed[j]; });
  return cut && best === Infinity ? null : best;   // null: too big to work out exactly
}
