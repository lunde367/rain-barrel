// Level generator: builds levels for each world in curriculum.mjs, rates them, and keeps the ones
// that hit each level's target difficulty. Writes js/data/lab.js (played in test mode, under
// "Level Lab") and tools/levelgen/report.md.
//
//   node tools/levelgen/generate.mjs            all worlds, seed 1
//   node tools/levelgen/generate.mjs 42         a different batch (seed 42)
//
// A level is accepted only if it: can be solved; has at most 2 different best answers; doesn't
// start out solved; and scores within TOLERANCE of its target.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { solve } from './solver.mjs';
import { PLAN as LAB_PLAN, SHED, TOLERANCE, TRIES, START_AT } from './curriculum.mjs';
const PLAN = process.argv.includes('--shed') ? [SHED] : LAB_PLAN;
// --only=0,1  make just these worlds (to run several copies side by side); each world is saved to
// tools/levelgen/out/<n>.json. --write  then gathers every saved world into js/data/generated.js.
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean).map(Number);
const WRITE = process.argv.includes('--write');
// --more  with --only: top up worlds that came out short (the biggest boards can be too slow to
// check), making the missing levels on boards of at most 8x8, then add them to the saved world.
const MORE = process.argv.includes('--more'), SMALL = process.argv.includes('--small');
import { blank, placeEnds, carvePath, lay, PATTERNS, toRows, rngFrom } from './patterns.mjs';
import { rate } from './rate.mjs';
import { solved } from '../../web/js/engine/flow.js';
import { prepare } from '../../web/js/engine/game.js';

const SHED_MODE = process.argv.includes('--shed');
const seed = +(process.argv.slice(2).find(a => /^\d+$/.test(a)) || 1);
const lerp = (pair, t) => Array.isArray(pair) ? pair[0] + (pair[1]-pair[0])*t : pair;
const ADJ = ['Muddy','Sunny','Mossy','Quiet','Twisty','Thirsty','Windy','Pebbly','Shady','Dusty','Dewy','Crooked','Lazy','Bumpy','Misty','Sleepy'];
const NOUN = ['Ditch','Furrow','Trickle','Puddle','Bend','Orchard','Lane','Hollow','Patch','Brook','Meadow','Corner','Gully','Terrace','Field','Spring'];

// One attempt at a level for world W at progress t (0 = first level, 1 = last).
function build(W, t, R){
  const w = Math.round(lerp(W.width, t) + (R.f()-.5)), h = Math.round(lerp(W.height, t) + (R.f()-.5));
  const B = blank(Math.max(3, w), Math.max(3, h));
  const plants = Math.max(1, Math.round(lerp(W.plants, t) + (R.f()-.5)*.8));
  const ends = placeEnds(B, R, { plants, minDist: Math.max(3, Math.round((B.W+B.H)/3)) }); if (!ends) return null;
  const used = [];
  const shortcut = R.chance(lerp(W.patterns.decoyShortcut || 0, t));
  // The real route: winding, and kept away from the straight line when a decoy shortcut will use it.
  let tree = [...ends.srcs];
  for (const p of ends.pls){
    const avoid = shortcut ? (x => { const s=ends.srcs[0], dx=p.c-s.c, dy=p.r-s.r, len=Math.hypot(dx,dy)||1;
      const d = Math.abs((x.c-s.c)*dy - (x.r-s.r)*dx)/len; return d < .8 ? 3 : 0; }) : null;
    const path = carvePath(B, R, tree, p, { wiggle: lerp(W.wiggle, t), avoid }); if (!path) return null;
    lay(B, path); tree = tree.concat(path.filter(x => x.k==='pipe'));
  }
  if (shortcut){ if (PATTERNS.decoyShortcut(B, R, ends, W.penalty)) used.push(`decoy shortcut (${W.penalty==='none'?'rocks':W.penalty})`); }
  if (W.patterns.hills && R.chance(lerp(W.patterns.hills, t))){ const pumps = R.chance(lerp(W.pumps || 0, t)); PATTERNS.hills(B, R, ends, { pumps }); used.push(pumps ? 'hills + pump' : 'hills'); }
  const locked = Math.round(lerp(W.locked, t)); if (locked){ PATTERNS.lockedAnchor(B, R, ends, locked); used.push('locked anchor'); }
  if (W.patterns.sunPatch){ PATTERNS.sunPatch(B, R, ends, lerp(W.patterns.sunPatch, t)); used.push('sun-baked patch'); }
  PATTERNS.rocks(B, R, ends, lerp(W.rocks, t));
  const jn = lerp(W.junctions || 0, t); if (jn > .02){ PATTERNS.junctions(B, R, ends, jn); used.push('junctions'); }
  const shapes = W.shapes ? W.shapes[0].map((v,i) => v + (W.shapes[1][i]-v)*t) : undefined;
  const dec = lerp(W.decoys, t); if (dec > .05){ PATTERNS.decoyFill(B, R, ends, dec, shapes); used.push('decoy fill'); }
  if (W.penalty==='none' && shortcut){   // in the first world a shortcut is simply blocked by a rock later on
    const alt = B.cells.filter(x => x.alt && !x.route && x.k==='pipe'); if (alt.length){ R.pick(alt).k='#'; } }
  // the newer mechanics (preview worlds)
  if (W.cactus && PATTERNS.cactus(B, R, ends, Math.round(lerp(W.cactus, t)))) used.push('stay-dry cactus');
  if (W.tray && PATTERNS.tray(B, R, ends, { pieces:Math.round(lerp(W.tray, t)), slots:Math.round(lerp(W.slots||0, t)), spares:Math.round(lerp(W.spares||0, t)) })) used.push('tray pieces');
  if (W.linked && PATTERNS.linked(B, R, ends, { groups:Math.round(lerp(W.linked, t)), size:Math.round(lerp(W.linkSize||[2,3], t)) })) used.push('linked pieces');
  const level = { rows: toRows(B), src: R.pick(W.sources) };
  if (B.extra && B.extra.length) level.extra = B.extra;
  if (ends.srcs.length > 1) level.src = 'barrel';
  return { level, used };
}

// Solve, check the rules, set the barrel size, and rate.
export const WHY = {};
const no = why => { WHY[why] = (WHY[why]||0)+1; return null; };
function finish(cand, W, t, R){
  const r0 = solve(cand.level, { nodeLimit:150000 });
  if (!r0.solvable) return no('unsolvable'); if (r0.optimal > 2) return no('too many answers'); if (r0.min < 2) return no('too short'); if (r0.truncated) return no('too big to check');
  const level = { ...cand.level, rows: r0.rows }; if (r0.extra && r0.extra.length) level.extra = r0.extra; else delete level.extra;
  if (W.cap && R.chance(lerp(W.cap, t))){ level.cap = r0.min; level.src = 'barrel'; cand.used.push('limited barrel'); }
  const r = rate(level); if (!r.solvable || r.optimal > 2) return null;
  if ((W.require||[]).some(m => !r.mechanics.includes(m))) return no('missing world mechanic');
  // must not start out solved after the game's own scramble
  const S = prepare(level, 1234);
  if (solved(S, S.flow)) return no('starts solved');
  return { level:{ ...level, rows:r.rows, ...(r.extra && r.extra.length ? { extra:r.extra } : {}) }, rating:r, used:cand.used };
}

// Gather the saved worlds into the real game's generated levels, with unique names.
function writeGame(){
  const R = rngFrom(seed), taken = new Set(), worlds = [];
  const nameOf = () => { for (;;){ const n = `${R.pick(ADJ)} ${R.pick(NOUN)}`; if (!taken.has(n)){ taken.add(n); return n; } } };
  PLAN.forEach((W, wi) => { const f = new URL(`${wi}.json`, OUT); if (!existsSync(f)){ console.error(`Missing world ${wi} (${W.name}): run --only=${wi} first`); process.exit(1); }
    worlds.push({ name:W.name, levels: JSON.parse(readFileSync(f, 'utf8')).map(L => { const { score, effort, size, used, ...level } = L;
      return { name:nameOf(), ...level, note:'', score }; }) }); });
  writeFileSync(new URL('../../web/js/data/generated.js', import.meta.url),
`// The real game's generated levels, made by tools/levelgen/generate.mjs from curriculum.mjs.
// levels.js puts each world's hand-made teaching levels first, then these.
// They're part of the real game, so only regenerate on purpose (stars are saved by level name).
// score = difficulty from rate.mjs.
export const GENERATED = ${JSON.stringify(worlds, null, 1)};
`);
  console.log(`Wrote js/data/generated.js (${worlds.reduce((a,w) => a+w.levels.length, 0)} levels)`); process.exit(0);
}

function checkPlan(){
  const problems = [], chain = PLAN.filter(W => !W.preview);   // preview worlds skip the ordering rules
  PLAN.forEach(W => { if (W.to <= W.from) problems.push(`${W.name}: last level must be harder than the first`); });
  chain.forEach((W, i) => { if (!i) return; const P = chain[i-1], low = P.from + (P.to-P.from)*START_AT;
    if (W.from < low) problems.push(`${W.name} starts too easy: its first level should be at least ${low.toFixed(1)} (${Math.round(START_AT*100)}% of the way up ${P.name})`);
    if (W.from >= P.to) problems.push(`${W.name} starts too hard: its first level should be easier than ${P.name}'s last (${P.to})`);
    if (W.to <= P.to) problems.push(`${W.name} must end harder than ${P.name}`); });
  if (problems.length){ console.error('The difficulty plan breaks the rules:\n  ' + problems.join('\n  ')); process.exit(1); }
}

checkPlan();
const OUT = new URL('./out/', import.meta.url);
if (WRITE) writeGame();
const R = rngFrom(seed + 101*(ONLY[0] || 0)), out = [], report = [];
PLAN.forEach((W0, wi) => { let W = W0;
  if (ONLY.length && !ONLY.includes(wi)) return;
  const found = [], have = MORE ? JSON.parse(readFileSync(new URL(`${wi}.json`, OUT), 'utf8')) : [];
  const missing = W.count - have.length;
  if (MORE){ W = { ...W, width:[W.width[0], Math.min(8, W.width[1])], height:[W.height[0], Math.min(8, W.height[1])],
    ...(W.tray ? { tray:[2,3], slots:[1,2], spares:[1,1] } : {}) };
    if (SMALL) W = { ...W, width:[6,7], height:[6,7], ...(W.tray ? { tray:[1,2], slots:[1,1], spares:[0,1] } : {}) }; }
  for (let li=0; li<(MORE ? missing : W.count); li++){
    // topping up: spread the missing levels over the harder half of the world
    const t = MORE ? (missing > 1 ? .45 + .5*li/(missing-1) : .8) : (W.count > 1 ? li/(W.count-1) : 0), target = W.from + (W.to-W.from)*t;
    let best = null; const t0 = Date.now();
    for (let k=0; k<TRIES && Date.now()-t0 < 45000; k++){   // at most 45 seconds per level
      const c = build(W, t, R); if (!c) continue;
      const f = finish(c, W, t, R); if (!f) continue;
      const off = Math.abs(f.rating.score - target);
      if (!best || off < best.off) best = { ...f, off };
      if (off <= TOLERANCE) break;
    }
    if (!best){ console.log(`${W.name} ${li+1}: no level found`); continue; }
    best.rating.traps = rate(best.level, { traps:true }).traps;
    console.error(`  ${W.name} ${li+1}/${W.count}: target ${target.toFixed(1)} got ${best.rating.score}`);
    found.push({ ...best, target });
  }
  // Rule 1: within a world, easiest first. Sorting by score guarantees it even when a level overshoots.
  found.sort((a,b) => a.rating.score - b.rating.score);
  found.forEach((best, li) => {
    const name = `${ADJ[Math.floor(R.f()*ADJ.length)]} ${NOUN[Math.floor(R.f()*NOUN.length)]}`, r = best.rating;
    out.push({ name, world:wi, ...best.level,
      note:`Generated: score ${r.score}. ${best.used.join(', ') || 'plain route'}.` });
    report.push(`| ${W.name} | ${li+1} | ${name} | ${best.target.toFixed(1)} | ${r.score}${best.off > TOLERANCE ? ' ⚠' : ''} | ${r.size} | ${r.pieces} | ${r.decoys} | ${r.traps} | ${r.min}${best.level.cap?` (cap ${best.level.cap})`:''} | ${best.used.join(', ') || '-'} |`);
    console.log(`${W.name} ${li+1}: ${name.padEnd(16)} score ${String(r.score).padStart(4)}  ${r.size}  ${best.used.join(', ')}`);
  });
  if (ONLY.length && !SHED_MODE){ mkdirSync(OUT, { recursive:true });
    const all = have.concat(found.map(b => ({ ...b.level, score:b.rating.score, effort:b.rating.effort, size:b.rating.size, used:b.used })))
      .sort((a, b) => a.score - b.score);
    writeFileSync(new URL(`${wi}.json`, OUT), JSON.stringify(all, null, 1)); }
});
if (ONLY.length && !SHED_MODE){ console.log('\nSaved worlds', ONLY.join(', '), 'to tools/levelgen/out/'); process.exit(0); }

if (SHED_MODE){
  // Bonus levels for the real game. Each opens once the player has enough stars in total.
  out.forEach((L, i) => { L.needTotal = SHED.needTotal[i]; delete L.world; L.note = `A bonus puzzle for star collectors.`; });
  writeFileSync(new URL('../../web/js/data/shed.js', import.meta.url),
`// Puzzle Shed: bonus levels made by tools/levelgen/generate.mjs --shed (seed ${seed}).
// These are part of the real game (stars are saved for them), so only regenerate on purpose.
// needTotal = total stars from the main worlds needed to open the level.
export const SHED = ${JSON.stringify(out, null, 1)};
`);
  console.log(`\nWrote js/data/shed.js (${out.length} levels)`); process.exit(0);
}
const worlds = PLAN.map(W => ({ name:W.name + (W.preview ? ' (preview)' : ''), icon:W.icon, grass:W.grass, hot:!!W.hot }));
writeFileSync(new URL('../../web/js/data/lab.js', import.meta.url),
`// Generated by tools/levelgen/generate.mjs (seed ${seed}). Don't edit by hand: change curriculum.mjs and run it again.
// These levels only show in test mode, under "Level Lab". Copy the ones you like into levels.js.
export const LAB = ${JSON.stringify({ seed, worlds, levels:out }, null, 1)};
`);
writeFileSync(new URL('./report.md', import.meta.url),
`# Level Lab report (seed ${seed})

Generated by \`node tools/levelgen/generate.mjs ${seed}\`. Targets come from curriculum.mjs; ⚠ means no level got within ${TOLERANCE} of the target.

| World | # | Name | Target | Score | Size | Pieces | Decoys | Traps | Best water | Patterns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${report.join('\n')}
`);
console.log('\nRejected attempts:', WHY);
console.log(`\nWrote js/data/lab.js (${out.length} levels) and tools/levelgen/report.md`);
