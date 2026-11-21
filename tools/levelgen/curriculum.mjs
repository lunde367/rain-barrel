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
// Scores come from rate.mjs (the 16 hand-made levels score from about 3 to 30).
export const PLAN = [
  { name:'Spring Meadow', icon:'barrel', grass:['#a6cf8a','#9ec781'], count:10, from:3, to:15,
    width:[4,7], height:[3,6], plants:[1,2], wiggle:[.5,2], decoys:[0,.45], rocks:[.25,.12], locked:[1,0],
    patterns:{ decoyShortcut:[0,.3] }, penalty:'none', sources:['barrel','house','pond'] },
  { name:'Summer Heat', icon:'sun', grass:['#c3cb88','#b9c17e'], hot:true, count:8, from:11, to:22,
    width:[5,7], height:[5,7], plants:[1,2], wiggle:[1,2], decoys:[.3,.55], rocks:[.15,.1], locked:[1,0],
    patterns:{ decoyShortcut:[.7,1], sunPatch:[.2,.4] }, penalty:'hot', require:['hot'], sources:['well','barrel','barn'] },
  { name:'Thirsty Cows', icon:'cow', grass:['#9ccc8f','#93c386'], count:8, from:18, to:29,
    width:[6,8], height:[5,7], plants:[1,2], wiggle:[1,2.5], decoys:[.3,.5], rocks:[.12,.08], locked:[0,0],
    patterns:{ decoyShortcut:[1,1] }, penalty:'cows', require:['cows'], cap:[.5,1], sources:['barrel'] },
  { name:'Hill Country', icon:'hill', grass:['#a6cf8a','#9ec781'], count:8, from:25, to:36,
    width:[6,8], height:[6,8], plants:[1,2], wiggle:[1,2.5], decoys:[.35,.55], rocks:[.1,.06], locked:[0,0],
    patterns:{ decoyShortcut:[.5,.8], hills:[1,1] }, penalty:'cows', require:['hills'], pumps:[.3,.8], cap:[0,.6], sources:['river','pond','barrel'] },

  // Previews of the newer mechanics. `preview` worlds skip the ordering rules until we decide
  // where they go in the real game; they still get easier-to-harder levels inside.
  { name:'Cactus Patch', preview:true, icon:'cactus', grass:['#c9cf8e','#bfc684'], count:6, from:10, to:22,
    width:[5,7], height:[4,6], plants:[1,2], wiggle:[1,2], decoys:[.3,.5], rocks:[.12,.08], locked:[0,0],
    patterns:{ decoyShortcut:[.3,.6] }, penalty:'cows', cactus:[2,4], require:['cactus'], sources:['well','pond','barrel'] },
  { name:'Potting Shed', preview:true, icon:'tray', grass:['#a6cf8a','#9ec781'], count:6, from:10, to:24,
    width:[4,6], height:[4,6], plants:[1,2], wiggle:[1,2], decoys:[.2,.4], rocks:[.15,.1], locked:[0,0],
    patterns:{}, penalty:'none', tray:[1,3], slots:[1,3], spares:[0,2], require:['tray'], sources:['barrel','house','barn'] },
  { name:'Clockwork Garden', preview:true, icon:'link', grass:['#9ccc8f','#93c386'], count:6, from:10, to:24,
    width:[5,7], height:[4,6], plants:[1,2], wiggle:[1,2], decoys:[.3,.5], rocks:[.12,.08], locked:[0,0],
    patterns:{}, penalty:'none', linked:[1,2], linkSize:[2,4], require:['linked'], sources:['barrel','pond','river'] },
];

// The Puzzle Shed: hard bonus levels for the real game, opened by total stars (needTotal, one per
// level). Mixes the main game's mechanics on big boards. Made with: node tools/levelgen/generate.mjs --shed
export const SHED = { name:'Puzzle Shed', icon:'shed', grass:['#a6cf8a','#9ec781'], count:6, from:24, to:36,
  width:[7,8], height:[6,8], plants:[2,3], wiggle:[2,3], decoys:[.45,.6], rocks:[.1,.06], locked:[0,0],
  patterns:{ decoyShortcut:[1,1], sunPatch:[.15,.25] }, penalty:'cows', cap:[.5,1], require:['cows'],
  sources:['barrel'], needTotal:[18, 24, 30, 36, 42, 48] };

// How close a level's score must be to its target, and how hard the generator tries.
// A new world's first level must be at least this far up the previous world's range (0 = its first level, 1 = its last).
export const START_AT = .6;
export const TOLERANCE = 1.5;
export const TRIES = 500;
