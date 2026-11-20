// The difficulty plan: the rules the generator follows for each world.
//
// General rules (checked by generate.mjs):
//   1. Inside a world, levels get harder from first to last (the target score climbs from `from` to `to`).
//   2. Each world starts harder than the world before it started, and ends harder than it ended.
//   3. Each world brings in its own mechanic (`require`): every level in it must use that mechanic.
//
// Every number with two values is [first level, last level]; levels in between get a blend.
// Scores come from rate.mjs (the 16 hand-made levels score from about 3 to 30).
export const PLAN = [
  { name:'Spring Meadow', icon:'barrel', grass:['#a6cf8a','#9ec781'], count:10, from:3, to:13,
    width:[4,6], height:[3,5], plants:[1,2], wiggle:[.5,2], decoys:[0,.45], rocks:[.25,.12], locked:[1,0],
    patterns:{ decoyShortcut:[0,.3] }, penalty:'none', sources:['barrel','house','pond'] },
  { name:'Summer Heat', icon:'sun', grass:['#c3cb88','#b9c17e'], hot:true, count:8, from:9, to:18,
    width:[5,6], height:[4,6], plants:[1,2], wiggle:[1,2], decoys:[.3,.55], rocks:[.15,.1], locked:[1,0],
    patterns:{ decoyShortcut:[.7,1], sunPatch:[.2,.4] }, penalty:'hot', require:['hot'], sources:['well','barrel','barn'] },
  { name:'Thirsty Cows', icon:'cow', grass:['#9ccc8f','#93c386'], count:8, from:12, to:22,
    width:[5,6], height:[4,6], plants:[1,2], wiggle:[1,2.5], decoys:[.3,.5], rocks:[.12,.08], locked:[0,0],
    patterns:{ decoyShortcut:[1,1] }, penalty:'cows', require:['cows'], cap:[.5,1], sources:['barrel'] },
  { name:'Hill Country', icon:'hill', grass:['#a6cf8a','#9ec781'], count:8, from:14, to:26,
    width:[5,6], height:[4,6], plants:[1,2], wiggle:[1,2.5], decoys:[.35,.55], rocks:[.1,.06], locked:[0,0],
    patterns:{ decoyShortcut:[.5,.8], hills:[1,1] }, penalty:'cows', require:['hills'], pumps:[.3,.8], cap:[0,.6], sources:['river','pond','barrel'] },
];

// How close a level's score must be to its target, and how hard the generator tries.
export const TOLERANCE = 1.5;
export const TRIES = 500;
