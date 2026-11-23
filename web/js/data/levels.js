// Rain Barrel's levels, written in their SOLVED state; the game scrambles the pieces.
// S = rain barrel, P = plant, # = rock, C = cow, . = grass
// Pipes: ─ │ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼   Marks after a piece: * locked, ! sun-baked (3 drops),
// a digit = hill height, p = windmill pump. cap = how many drops the barrel holds.
// src = where the water comes from: barrel (default), house or barn (a garden hose), pond, river, well.
// Levels with a cap always use barrels, since a barrel is what holds a set number of drops.

// Worlds are the "gardens" on the home screen; parts group them like Carrot Patch's story parts.
// Stars are saved by level id (made from the name), so levels can be reordered or added freely.
// need = stars you must collect in the world before it to open this one (about two thirds of them).
// Every level in an open world can be played in any order, except that Spring Meadow 1 (the tutorial) comes first.
import { LAB } from './lab.js';
import { SHED } from './shed.js';
import { GENERATED } from './generated.js';
import { levelId } from './ids.js';
import { STARTS } from './starts.js';

export const PARTS = [
  { n:1, name:'The Meadow', tint:'#4f8a3c' },
  { n:2, name:'The Farm', tint:'#3a9cc4' },
  { n:3, name:'The Wild Garden', tint:'#c07a2c' },
  { n:4, name:'Puzzle Shed', label:'Bonus', tint:'#6f5bd4' },   // bonus levels opened by total stars
  { n:5, name:'Level Lab', label:'Test', tint:'#8a5aa8', lab:true },   // generated levels to try out, test mode only
];
export const WORLDS = [
  { name:'Spring Meadow', blurb:'Rocks, corners and stuck pieces', icon:'barrel', part:1, grass:['#a6cf8a','#9ec781'] },
  { name:'Summer Heat', need:24, blurb:'Sun-baked tiles soak up water', icon:'sun', part:1, grass:['#c3cb88','#b9c17e'], hot:true },
  { name:'Thirsty Cows', need:20, blurb:'Cows drink, barrels run dry', icon:'cow', part:2, grass:['#9ccc8f','#93c386'] },
  { name:'Hill Country', need:20, blurb:'Water only flows downhill', icon:'hill', part:2, grass:['#a6cf8a','#9ec781'] },
  { name:'Cactus Patch', need:20, blurb:'Keep every drop off the cactus', icon:'cactus', part:3, grass:['#c9cf8e','#bfc684'] },
  { name:'Potting Shed', need:20, blurb:'Place pieces from the tray', icon:'tray', part:3, grass:['#a6cf8a','#9ec781'] },
  { name:'Clockwork Garden', need:16, blurb:'Linked pieces turn together', icon:'link', part:3, grass:['#9ccc8f','#93c386'] },
];
// Teaching notes for worlds with no hand-made level: shown on the world's first generated level.
const INTRO = {
  4:'Cactuses must stay dry: no channel may point water at one.',
  5:'Some pieces start in the tray. Tap one, then tap an empty dirt slot to place it. Press and hold a placed piece to put it back.',
  6:'Pieces with the same colored flower turn together.',
};
const HAND = [
 {name:"First Sip",world:0,note:"Tap a channel to turn it. Get water from the barrel to the sprout.",rows:[
  ". . . .",
  "S ─ ─ P",
  ". . . ."]},
 {name:"Around the Bend",world:0,note:"Corner pieces turn the water.",rows:[
  "S ─ ┐ .",
  ". . │ .",
  ". . └ P"]},
 {name:"Two Sprouts",src:"pond",world:0,note:"A T-split sends water two ways at once.",rows:[
  ". . P . .",
  "S ─ ┴ ─ ┐",
  ". . . . P"]},
 {name:"Locked Gate",world:0,note:"Pieces with a stone rim are stuck in place. Work around them.",rows:[
  "S ┐ . . .",
  ". ├* ─ ┐ .",
  ". │ # │ .",
  ". └ P └ P"]},
 {name:"Hot Afternoon",src:"well",world:1,note:"Sun-baked tiles dry out water: each costs 3 drops. The shortest path isn't the cheapest.",rows:[
  "┌ ─ ─ ─ ─ ─ ┐",
  "│ . . . . . │",
  "S │ │! │! │! │ P"]},
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

// Each main world: its hand-made teaching levels first, then the generated levels (easiest first).
const DATA = [];
WORLDS.forEach((W, wi) => {
  DATA.push(...HAND.filter(L => L.world===wi));
  (GENERATED[wi] ? GENERATED[wi].levels : []).forEach((L, k) => DATA.push({ ...L, world:wi, note: L.note || (k===0 && INTRO[wi]) || '' }));
});

// The Puzzle Shed: bonus levels, each opened by total stars from the main worlds (needTotal).
WORLDS.push({ name:'Puzzle Shed', blurb:'Huge bonus puzzles for star collectors', icon:'shed', part:4, shed:true, grass:['#a6cf8a','#9ec781'] });
for (const L of SHED) DATA.push({ ...L, world:WORLDS.length-1, shed:true, id: L.id || 'shed-' + levelId(L.name) });

// Level Lab: generated levels being tried out (tools/levelgen, test mode only).
const BASE = WORLDS.length;
for (const w of LAB.worlds) WORLDS.push({ ...w, name:`Lab: ${w.name}`, blurb:'Generated levels to try out', part:5, lab:true });
for (const L of LAB.levels) DATA.push({ ...L, world:BASE + L.world, lab:true, id:'lab-' + levelId(L.name) + '-' + L.world });

// Flat list with handy indexes: gi = position in the whole game, li = position in its world.
export const SOURCES = {
  barrel:{ name:'rain barrel' }, house:{ name:'farmhouse hose' }, barn:{ name:'barn hose' },
  pond:{ name:'pond' }, river:{ name:'river' }, well:{ name:'old well' },
};

export const LEVELS = DATA.map((L, gi) => ({ ...L, id: L.id || levelId(L.name), start: STARTS[L.id || levelId(L.name)], gi, wi:L.world, li:DATA.slice(0, gi).filter(x => x.world===L.world).length, W:WORLDS[L.world] }));
