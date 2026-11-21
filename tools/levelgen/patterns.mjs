// Building blocks for generated levels: a blank board, route carving, and the strategy patterns.
// A board is a grid of cells: { k:'.'|'#'|'S'|'P'|'C'|'pipe', m:connection bits, hot, h, pump, locked }.
// Connection bits: N=1, E=2, S=4, W=8 (same as the game).
import { mulberry32 } from '../../web/js/engine/flow.js';

export const DIRS = [[1,-1,0],[2,0,1],[4,1,0],[8,0,-1]];
const OPP = {1:4,2:8,4:1,8:2};
export const rngFrom = seed => { const r = mulberry32(seed); return { f:r, int:(a,b) => a + Math.floor(r()*(b-a+1)), pick:a => a[Math.floor(r()*a.length)], chance:p => r() < p }; };

export function blank(W, H){
  const cells = []; for (let r=0;r<H;r++) for (let c=0;c<W;c++) cells.push({ r, c, k:'.', m:0, hot:false, h:0, pump:false, locked:false, route:false, alt:false });
  return { W, H, cells, at:(r,c) => (r<0||c<0||r>=H||c>=W) ? null : cells[r*W+c] };
}
const free = (B, x) => x && x.k==='.' && !x.route && !x.alt;
const dist = (a,b) => Math.abs(a.r-b.r) + Math.abs(a.c-b.c);

// Cheapest path through free cells from any cell in `starts` to `goal`, with random cell costs so
// routes wiggle. `wiggle` 0 = straight-ish, 3 = very winding. `avoid` adds cost near some cells.
export function carvePath(B, R, starts, goal, { wiggle = 1, avoid = null } = {}){
  const cost = new Map(); B.cells.forEach(x => cost.set(x, 1 + R.f()*wiggle + (avoid ? avoid(x) : 0)));
  const d = new Map(), prev = new Map(), open = [];
  for (const s of starts){ d.set(s, 0); open.push(s); }
  while (open.length){
    open.sort((a,b) => d.get(a)-d.get(b)); const x = open.shift();
    if (x === goal) break;
    for (const [,dr,dc] of DIRS){ const n = B.at(x.r+dr, x.c+dc); if (!n) continue;
      if (n !== goal && !free(B, n)) continue;
      const nd = d.get(x) + cost.get(n); if (nd < (d.get(n) ?? Infinity)){ d.set(n, nd); prev.set(n, x); if (!open.includes(n)) open.push(n); } }
  }
  if (!prev.has(goal)) return null;
  const path = [goal]; while (!starts.includes(path[0])) path.unshift(prev.get(path[0]));
  return path;
}
// Join each step of a path with channel bits. Middle cells become pipes.
export function lay(B, path, flag = 'route'){
  for (let i=0;i<path.length-1;i++){
    const a = path[i], b = path[i+1], bit = DIRS.find(([,dr,dc]) => a.r+dr===b.r && a.c+dc===b.c)[0];
    if (a.k==='.' || a.k==='pipe'){ a.k='pipe'; a.m |= bit; a[flag] = true; }
    if (b.k==='.' || b.k==='pipe'){ b.k='pipe'; b.m |= OPP[bit]; b[flag] = true; }
  }
}
// Pick a random edge-ish cell for a water source and far-away cells for the plants.
export function placeEnds(B, R, { plants = 1, sources = 1, minDist = 3 }){
  const all = B.cells.slice(), srcs = [], pls = [];
  for (let s=0; s<sources; s++){
    const edge = all.filter(x => x.k==='.' && (x.r===0||x.c===0||x.r===B.H-1||x.c===B.W-1) && srcs.every(o => dist(o,x) >= minDist));
    const x = R.pick(edge.length ? edge : all.filter(x => x.k==='.')); x.k='S'; srcs.push(x);
  }
  for (let p=0; p<plants; p++){
    const far = all.filter(x => x.k==='.' && srcs.every(s => dist(s,x) >= minDist) && pls.every(o => dist(o,x) >= 2));
    if (!far.length) return null;
    // prefer the far half of the board so routes are long enough
    far.sort((a,b) => Math.min(...srcs.map(s => dist(s,b))) - Math.min(...srcs.map(s => dist(s,a))));
    const x = far[R.int(0, Math.max(0, Math.floor(far.length/2)-1))]; x.k='P'; pls.push(x);
  }
  return { srcs, pls };
}

// ---------- strategy patterns ----------
// Each pattern changes the board to create a specific kind of thinking. The generator mixes them by rule.
export const PATTERNS = {
  // DECOY SHORTCUT: the obvious short route is quietly ruined (cows drink from it, the sun bakes it,
  // or a hill blocks it), so the real answer is a longer route the player has to notice.
  decoyShortcut(B, R, { srcs, pls }, penalty){
    const goal = pls[0], alt = carvePath(B, R, srcs, goal, { wiggle:.2 });
    if (!alt || alt.length < 3) return false;
    lay(B, alt, 'alt');
    const altCells = alt.filter(x => x.k==='pipe' && x.alt && !x.route);
    if (!altCells.length) return false;
    if (penalty==='hot') altCells.forEach(x => { x.hot = true; });
    else if (penalty==='hill'){ const x = altCells[Math.floor(altCells.length/2)]; x.h = 2; x.ridge = true; }
    else {   // cows: on free grass beside the shortcut, but not beside the real route
      const spots = B.cells.filter(x => x.k==='.' && !x.route && !x.alt && DIRS.some(([,dr,dc]) => { const n=B.at(x.r+dr,x.c+dc); return n && n.alt; })
        && !DIRS.some(([,dr,dc]) => { const n=B.at(x.r+dr,x.c+dc); return n && n.route; }));
      if (!spots.length) return false;
      const n = Math.min(spots.length, R.int(1, 3)); for (let i=0;i<n;i++){ const s = spots.splice(Math.floor(R.f()*spots.length),1)[0]; s.k='C'; }
    }
    return true;
  },
  // DECOY FILL: extra pieces on empty grass, so there are many more ways to go wrong.
  // `shapes` = how likely each kind of piece is: [straight, corner, T, cross]. More T's and crosses
  // means more ways for water to branch off and leak, which is what makes a dense board hard.
  decoyFill(B, R, ends, amount, shapes = [.35,.45,.2,0]){
    const kinds = [[10,5],[3,6,12,9],[7,13,14,11],[15]], total = shapes.reduce((a,b) => a+b, 0);
    for (const x of B.cells) if (free(B, x) && R.chance(amount)){
      let r = R.f()*total, k = 0; while (k < 3 && r > shapes[k]){ r -= shapes[k]; k++; }
      x.k='pipe'; x.m = R.pick(kinds[k]); x.decoy = true; }
  },
  // JUNCTIONS: give some pieces of the real route an extra opening (a corner becomes a T, a T a cross).
  // The extra arm has to be pointed somewhere harmless, so the player can't just follow the route.
  junctions(B, R, ends, amount){
    for (const x of B.cells){ if (x.k!=='pipe' || !x.route || x.locked || x.tray || !R.chance(amount)) continue;
      const open = DIRS.filter(([bit]) => !(x.m & bit)); if (!open.length) continue;
      x.m |= R.pick(open)[0]; }
  },
  // ROCKS: block some grass, narrowing the choices (easier) or forcing a detour (when put on shortcuts).
  rocks(B, R, ends, amount){ for (const x of B.cells) if (free(B, x) && R.chance(amount)) x.k='#'; },
  // LOCKED ANCHOR: a few pieces of the real route are stuck in place, giving the player a fixed
  // point to reason from. Makes a level easier; used early in a world.
  lockedAnchor(B, R, ends, count){
    const route = B.cells.filter(x => x.k==='pipe' && x.route);
    for (let i=0; i<count && route.length; i++) route.splice(Math.floor(R.f()*route.length),1)[0].locked = true;
  },
  // SUN-BAKED PATCH: some decoy pieces cost 3 drops, so routes through them are traps.
  sunPatch(B, R, ends, amount){ for (const x of B.cells) if (x.k==='pipe' && !x.route && R.chance(amount)) x.hot = true; },
  // HILLS: the real route steps downhill in a few big terraces, with a windmill pump where it must
  // climb. Every other tile takes the height of the nearest route tile, so hills come in large,
  // readable areas, plus one or two small ridges that block wrong routes.
  hills(B, R, { srcs }, { pumps = false } = {}){
    const order = bfsOrder(B, srcs);
    let h = 2, steps = 0;
    for (const x of order){
      if (x.k==='S'){ x.h = 2; continue; }
      if (!x.route && x.k!=='P') continue;
      x.h = h; if (steps < 2 && h > 0 && R.chance(.18)){ h--; steps++; }
    }
    if (pumps){ const climb = order.filter(x => x.route && x.h < 2); if (climb.length){ const x = R.pick(climb); x.pump = true; x.h += 1; } }
    // spread heights outward from the route, so each terrace becomes one big area
    const fixed = new Set(order.filter(x => x.k==='S' || x.route || x.k==='P'));
    const q = [...fixed], seen = new Set(fixed);
    while (q.length){ const x = q.shift();
      for (const [,dr,dc] of DIRS){ const n = B.at(x.r+dr, x.c+dc); if (!n || seen.has(n)) continue;
        seen.add(n); n.h = x.pump ? x.h-1 : x.h; q.push(n); } }
    // a ridge or two off the route
    for (let k=R.int(1,2); k>0; k--){
      const start = R.pick(B.cells.filter(x => !fixed.has(x) && x.h < 2)); if (!start) break;
      const blob = [start]; for (let i=0;i<R.int(1,3);i++){ const x = R.pick(blob), [,dr,dc] = R.pick(DIRS), n = B.at(x.r+dr, x.c+dc); if (n && !fixed.has(n) && !blob.includes(n)) blob.push(n); }
      const top = Math.min(2, start.h + 1); blob.forEach(x => { x.h = top; });
    }
  },
  // STAY-DRY CACTUS: cacti on grass right beside the real route. Turn a route piece the wrong way
  // and it pours onto a cactus, so the player has to think about where every opening points.
  cactus(B, R, ends, count){
    const spots = B.cells.filter(x => x.k==='.' && !x.route && !x.alt && DIRS.some(([,dr,dc]) => { const n=B.at(x.r+dr,x.c+dc); return n && n.route; }));
    let n = 0; for (; n<count && spots.length; n++) spots.splice(Math.floor(R.f()*spots.length),1)[0].k = 'X';
    return n > 0;
  },
  // TRAY: some pieces of the real route start in the tray, their tiles become empty slots, and
  // a few extra empty slots and spare pieces make the player work out what goes where.
  tray(B, R, ends, { pieces = 2, slots = 1, spares = 1 } = {}){
    const route = B.cells.filter(x => x.k==='pipe' && x.route && !x.locked && !x.tray);
    let n = 0; for (; n<pieces && route.length; n++) route.splice(Math.floor(R.f()*route.length),1)[0].tray = true;
    const empty = B.cells.filter(x => x.k==='.' && DIRS.some(([,dr,dc]) => { const m=B.at(x.r+dr,x.c+dc); return m && m.route; }));
    for (let i=0; i<slots && empty.length; i++) empty.splice(Math.floor(R.f()*empty.length),1)[0].k = '_';
    B.extra = Array.from({ length:spares }, () => R.pick(['─','┐','┌','└','┘','├','┬']));
    return n > 0;
  },
  // LINKED PIECES: a few pieces (some on the route, some not) turn together, so fixing one can
  // break another. The written solution keeps them all facing the right way at once.
  linked(B, R, ends, { groups = 1, size = 3 } = {}){
    const route = B.cells.filter(x => x.k==='pipe' && x.route && !x.locked && !x.tray && !x.link);
    const other = B.cells.filter(x => x.k==='pipe' && !x.route && !x.link);
    let made = 0;
    for (let g=0; g<groups; g++){ const name = 'abcd'[g], pick = [];
      for (let i=0; i<Math.ceil(size/2) && route.length; i++) pick.push(route.splice(Math.floor(R.f()*route.length),1)[0]);
      for (let i=pick.length; i<size && other.length; i++) pick.push(other.splice(Math.floor(R.f()*other.length),1)[0]);
      if (pick.length >= 2){ pick.forEach(x => { x.link = name; }); made++; } }
    return made > 0;
  },
  // LIMITED BARREL: the barrel holds exactly enough for the best route, so wasteful routes fail outright.
  // Applied after solving (see generate.mjs).
};
function bfsOrder(B, srcs){
  const seen = new Set(srcs), q = [...srcs], out = [];
  while (q.length){ const x = q.shift(); out.push(x);
    for (const [bit,dr,dc] of DIRS){ const n = B.at(x.r+dr, x.c+dc); if (!n || seen.has(n)) continue;
      if (n.route && (x.k==='S' || (x.m & bit)) || (n.k==='P' && x.route && (x.m & bit))){ seen.add(n); q.push(n); } } }
  return out;
}

// Turn a board into level rows in the game's format.
const TOKEN = { 10:'─', 5:'│', 3:'└', 6:'┌', 12:'┐', 9:'┘', 7:'├', 13:'┤', 14:'┬', 11:'┴', 15:'┼' };
export function toRows(B){
  const rows = [];
  for (let r=0;r<B.H;r++){ const row = [];
    for (let c=0;c<B.W;c++){ const x = B.at(r,c);
      let t = x.k==='pipe' ? (TOKEN[x.m] || null) : x.k;
      if (!t){ t = '.'; }   // a one-ended scrap of pipe: leave grass
      if (x.k==='pipe'){ if (x.locked) t += '*'; if (x.hot) t += '!'; if (x.pump) t += 'p'; if (x.tray) t += '+'; if (x.link) t += x.link; }
      if (x.h) t += x.h;
      row.push(t); }
    rows.push(row.join(' ')); }
  return rows;
}
