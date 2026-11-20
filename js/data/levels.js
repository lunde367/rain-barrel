// Rain Barrel's levels, written in their SOLVED state; the game scrambles the pieces.
// S = rain barrel, P = plant, # = rock, C = cow, . = grass
// Pipes: ─ │ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼   Marks after a piece: * locked, ! sun-baked (3 drops),
// a digit = hill height, p = windmill pump. cap = how many drops the barrel holds.
// src = where the water comes from: barrel (default), house or barn (a garden hose), pond, river, well.
// Levels with a cap always use barrels, since a barrel is what holds a set number of drops.

// Worlds are the "gardens" on the home screen; parts group them like Carrot Patch's story parts.
// need = stars you must collect in the world before it to open this one (about two thirds of them).
// Every level in an open world can be played in any order, except that Spring Meadow 1 (the tutorial) comes first.
import { LAB } from './lab.js';

export const PARTS = [
  { n:1, name:'The Meadow', tint:'#4f8a3c' },
  { n:2, name:'New ideas to test', tint:'#3a9cc4' },
  { n:3, name:'Level Lab', tint:'#8a5aa8', lab:true },   // generated levels, test mode only
];
export const WORLDS = [
  { name:'Spring Meadow', blurb:'Rocks, corners and stuck pieces', icon:'barrel', part:1, grass:['#a6cf8a','#9ec781'] },
  { name:'Summer Heat', need:16, blurb:'Sun-baked tiles soak up water', icon:'sun', part:1, grass:['#c3cb88','#b9c17e'], hot:true },
  { name:'Thirsty Cows', need:4, blurb:'Cows drink, barrels run dry', icon:'cow', part:2, grass:['#9ccc8f','#93c386'] },
  { name:'Hill Country', need:6, blurb:'Water only flows downhill', icon:'hill', part:2, grass:['#a6cf8a','#9ec781'] },
];
const DATA = [
 {name:"First Sip",world:0,note:"Tap a channel to turn it. Get water from the barrel to the sprout.",rows:[
  ". . . .",
  "S ─ ─ P",
  ". . . ."]},
 {name:"Around the Bend",world:0,note:"Corner pieces turn the water.",rows:[
  "S ─ ┐ .",
  ". . │ .",
  ". . └ P"]},
 {name:"Rock Garden",src:"house",world:0,note:"Rocks block water. Find a way around them.",rows:[
  "S ┐ # .",
  ". │ # P",
  ". └ ─ ┘"]},
 {name:"Two Sprouts",src:"pond",world:0,note:"A T-split sends water two ways at once.",rows:[
  ". . P . .",
  "S ─ ┴ ─ ┐",
  ". . . . P"]},
 {name:"Locked Gate",world:0,note:"Pieces with a stone rim are stuck in place. Work around them.",rows:[
  "S ┐ . . .",
  ". ├* ─ ┐ .",
  ". │ # │ .",
  ". └ P └ P"]},
 {name:"Stray Pipes",src:"river",world:0,note:"Not every pipe is needed. Watch for leaks: they waste water.",rows:[
  "S ─ ┐ ┘ .",
  "┌ . │ ─ .",
  "└ ┐ └ ─ P"]},
 {name:"Twin Barrels",world:0,note:"Two barrels, three thirsty plants.",rows:[
  "S ─ ┐ . P",
  ". . │ . │",
  "P ─ ┤ . │",
  ". . │ . S",
  ". . P . ."]},
 {name:"Long Way Round",src:"barn",world:0,note:"The meadow's last puzzle. Sometimes the long way is the only way.",rows:[
  "S ─ ─ ┐ # .",
  "# # └ │ # .",
  "┌ ─ ─ ┘* ─ .",
  "│ # # # # .",
  "└ ─ ┬* ─ ─ P",
  ". . P . ┐ ."]},
 {name:"Hot Afternoon",src:"well",world:1,note:"Sun-baked tiles dry out water: each costs 3 drops. The shortest path isn't the cheapest.",rows:[
  "┌ ─ ─ ─ ─ ─ ┐",
  "│ . . . . . │",
  "S │ │! │! │! │ P"]},
 {name:"Dry Spell",src:"well",world:1,note:"Three plants and scorching ground. Make every drop count.",rows:[
  ". . P . . .",
  ". . │ . . .",
  "S ─ ┴ ┐ # .",
  "# └ . │ # .",
  ". ┌ ─ ┴* ─! P",
  ". P . . . ."]},
 // --- New mechanics: C = cow, cap = barrel size, digits = hill height, p = windmill pump ---
 {name:"Moo-ving Water",src:"pond",world:2,note:"Cows drink 2 drops from any channel that runs past them. Can you keep the water away from the cow?",rows:[
  "S │ ─ ┐",
  "│ . C │",
  "│ . . │",
  "└ ─ ─ P"]},
 {name:"Last Drops",world:2,cap:9,note:"This barrel only holds 9 drops. When it runs dry, the water stops. Leaks waste 2 drops each.",rows:[
  "S ┴ ─ ┐",
  "┬ ┼ │ ┤",
  "│ │ . │",
  "└ ┴ ─ P"]},
 {name:"Pasture Problem",world:2,cap:7,note:"7 drops, three thirsty cows. The short way isn't always the best way.",rows:[
  ". C C C .",
  "S │ ─ ─ P",
  "│ . . . │",
  "└ ─ ─ ─ ┘"]},
 {name:"Downhill",src:"river",world:3,note:"Water only flows downhill or on level ground. Green is low, yellow-green is ▲1, tan is ▲2. Dark edges are cliffs.",rows:[
  "S1 │1 ─2 ─0 P0",
  "│1 . #2 . │0",
  "└1 ─1 ─1 ─0 ┘0"]},
 {name:"Windmill",src:"pond",world:3,note:"A windmill pump can lift water up one level. The plant is up on the hill.",rows:[
  ". . ┌2 ─2 P2",
  ". . │2p . │2",
  "S1 ─1 ┘1 │1 ┘1"]},
 {name:"High Pasture",world:3,cap:8,note:"Hills, cows and only 8 drops. Three ways around, but only one works.",rows:[
  "┌1 ─1 ─1 ─1 ┐1",
  "─1 C1 C1 C1 │1",
  "S1 │1 ─2 ─1 P1",
  "│1 .0 .0 .0 │1p",
  "└0 ─0 ─0 ─0 ┘0"]}
];

// Generated levels (tools/levelgen) go last, so they never shift the stars saved for real levels.
const BASE = WORLDS.length;
for (const w of LAB.worlds) WORLDS.push({ ...w, name:`Lab: ${w.name}`, blurb:'Generated levels to try out', part:3, lab:true });
for (const L of LAB.levels) DATA.push({ ...L, world:BASE + L.world, lab:true });

// Flat list with handy indexes: gi = position in the whole game, li = position in its world.
export const SOURCES = {
  barrel:{ name:'rain barrel' }, house:{ name:'farmhouse hose' }, barn:{ name:'barn hose' },
  pond:{ name:'pond' }, river:{ name:'river' }, well:{ name:'old well' },
};

export const LEVELS = DATA.map((L, gi) => ({ ...L, gi, wi:L.world, li:DATA.slice(0, gi).filter(x => x.world===L.world).length, W:WORLDS[L.world] }));
