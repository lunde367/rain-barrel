// The difficulty plan: the rules the generator follows for each world.
//
// General rules (checked by generate.mjs):
//   1. Inside a world, levels get harder from first to last (the target score climbs from `from` to `to`).
//   2. Each world ends harder than the world before it ended.
//   3. A new world starts only moderately easy: its first level sits at least START_AT of the way
//      up the previous world's range (never back at 'start from scratch' easy), but below its hardest.
//   4. Each world brings in its own mechanic (`require`): every level in it must use that mechanic.
//
// Every number with two values is [first level, last level]; levels in between get a blend.
// Scores come from rate.mjs (the hand-made levels score from 9 for First Sip to about 41 for Last Drops).
// The real game's worlds, in order. Each world opens with a few hand-made teaching levels
// (in levels.js); these generated levels follow them. `count` = generated levels in the world.
export const PLAN = [
  { name:'Spring Meadow', icon:'barrel', grass:['#a6cf8a','#9ec781'], count:8, from:14, to:30,
    width:[5,7], height:[4,7], plants:[1,2], wiggle:[1,2], decoys:[.5,.85], rocks:[.15,.08], locked:[1,0],
    shapes:[[.35,.45,.2,0],[.25,.35,.35,.05]], junctions:[.1,.35], cap:[.2,.8],
    patterns:{ decoyShortcut:[.2,.4] }, penalty:'none', sources:['barrel','house','pond'] },
  { name:'Summer Heat', icon:'sun', grass:['#c3cb88','#b9c17e'], hot:true, count:9, from:24, to:38,
    width:[6,8], height:[6,8], plants:[1,2], wiggle:[1,2.5], decoys:[.7,.88], rocks:[.1,.06], locked:[0,0],
    shapes:[[.25,.4,.3,.05],[.2,.3,.4,.1]], junctions:[.25,.45], cap:[.6,1],
    patterns:{ decoyShortcut:[.8,1], sunPatch:[.25,.4] }, penalty:'hot', require:['hot'], sources:['well','barrel','barn'] },
  { name:'Thirsty Cows', icon:'cow', grass:['#9ccc8f','#93c386'], count:8, from:32, to:44,
    width:[6,8], height:[6,9], plants:[1,3], wiggle:[1.5,2.5], decoys:[.75,.9], rocks:[.08,.05], locked:[0,0],
    shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.3,.5], cap:[1,1],
    patterns:{ decoyShortcut:[1,1] }, penalty:'cows', require:['cows'], sources:['barrel'] },
  { name:'Hill Country', icon:'hill', grass:['#a6cf8a','#9ec781'], count:8, from:38, to:50,
    width:[7,8], height:[7,9], plants:[1,3], wiggle:[1.5,2.5], decoys:[.75,.9], rocks:[.06,.04], locked:[0,0],
    shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.3,.5], cap:[.7,1],
    patterns:{ decoyShortcut:[.6,.9], hills:[1,1] }, penalty:'cows', require:['hills'], pumps:[.4,.8], sources:['river','pond','barrel'] },
  { name:'Cactus Patch', icon:'cactus', grass:['#c9cf8e','#bfc684'], count:10, from:44, to:52,
    width:[7,8], height:[7,9], plants:[2,3], wiggle:[1.5,2.5], decoys:[.75,.9], rocks:[.06,.04], locked:[0,0],
    shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.3,.5], cap:[.7,1],
    patterns:{ decoyShortcut:[.6,.9], sunPatch:[.1,.2] }, penalty:'cows', cactus:[3,5], require:['cactus'], sources:['well','pond','barrel'] },
  { name:'Potting Shed', icon:'tray', grass:['#a6cf8a','#9ec781'], count:8, from:48, to:54,
    width:[6,8], height:[7,9], plants:[2,3], wiggle:[1.5,2.5], decoys:[.7,.88], rocks:[.08,.05], locked:[0,0],
    shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.25,.45], cap:[.7,1],
    patterns:{ decoyShortcut:[.5,.8] }, penalty:'cows', tray:[2,4], slots:[2,3], spares:[1,2], require:['tray'], sources:['barrel','house','barn'] },
  { name:'Clockwork Garden', icon:'link', grass:['#9ccc8f','#93c386'], count:10, from:51, to:56,
    width:[7,8], height:[7,9], plants:[2,3], wiggle:[1.5,2.5], decoys:[.75,.9], rocks:[.06,.04], locked:[0,0],
    shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.3,.5], cap:[.7,1],
    patterns:{ decoyShortcut:[.5,.8] }, penalty:'cows', linked:[2,3], linkSize:[2,4], require:['linked'], sources:['barrel','pond','river'] },
];

// The Puzzle Shed: hard bonus levels for the real game, opened by total stars (needTotal, one per
// level). Mixes the main game's mechanics on big boards. Made with: node tools/levelgen/generate.mjs --shed
export const SHED = { name:'Puzzle Shed', icon:'shed', grass:['#a6cf8a','#9ec781'], count:8, from:50, to:60,
  width:[8,8], height:[9,10], plants:[2,3], wiggle:[2,3], decoys:[.75,.9], rocks:[.08,.05], locked:[0,0],
  shapes:[[.2,.35,.35,.1],[.15,.3,.4,.15]], junctions:[.3,.5],
  patterns:{ decoyShortcut:[1,1], sunPatch:[.15,.25] }, penalty:'cows', cap:[.5,1], require:['cows'],
  sources:['barrel'], needTotal:[40, 80, 120, 160, 200, 210, 215, 216] };

// How close a level's score must be to its target, and how hard the generator tries.
// A new world's first level must be at least this far up the previous world's range (0 = its first level, 1 = its last).
export const START_AT = .5;
export const TOLERANCE = 1.5;
export const TRIES = 300;
