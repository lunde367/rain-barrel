// The real game's generated levels, made by tools/levelgen/generate.mjs from curriculum.mjs.
// levels.js puts each world's hand-made teaching levels first, then these.
// They're part of the real game, so only regenerate on purpose. Stars are saved by `id`, which
// stays fixed even if a level is renamed.
// score = difficulty from rate.mjs.
export const GENERATED = [
 {
  "name": "Spring Meadow",
  "levels": [
   {
    "name": "Dandelion Dip",
    "id": "muddy-ditch",
    "rows": [
     ". . P . .",
     ". . │* . .",
     "│ . └ ─ ┐",
     "# . ┌ . S"
    ],
    "src": "barrel",
    "note": "",
    "score": 14.7
   },
   {
    "name": "Robin’s Rest",
    "id": "sleepy-corner",
    "rows": [
     ". . ┌ ┌ ├",
     ". ┐ ┴ . .",
     "┴ ┌* ─ ─ S",
     "# │ ┌ ─ ┌",
     "─ P # C C"
    ],
    "src": "house",
    "note": "",
    "score": 16.3
   },
   {
    "name": "Puddle Jump",
    "id": "shady-lane",
    "rows": [
     "┌ ┬ # # . ─",
     ". ┌ ─ ─ ─* S",
     "┘ │ ─ ┴ ┐ ┌",
     "# │ # . ┬ └",
     ". P . . . ."
    ],
    "src": "barrel",
    "cap": 6,
    "note": "",
    "score": 17.1
   },
   {
    "name": "Clover Corner",
    "id": "pebbly-puddle",
    "rows": [
     "# ┴ # . ┤ S",
     "┘ ─ ┌ ─ ─* ┘",
     "P ┴ ┘ . . .",
     "# . . . . ─",
     "# # ├ ─ . ┤"
    ],
    "src": "house",
    "note": "",
    "score": 20.2
   },
   {
    "name": "Tadpole Pond",
    "id": "shady-corner",
    "rows": [
     "# ┌ ─ S . ┴",
     "─ │ . ─ C ─",
     "P ┤ . │ ┘ └",
     "# │ . │ └ .",
     "┴ │ └ │ ├ ┐",
     "┌ └ P # ─ ."
    ],
    "src": "barrel",
    "cap": 7,
    "note": "",
    "score": 23.5
   },
   {
    "name": "Daisy Chain",
    "id": "twisty-trickle",
    "rows": [
     "┴ └ └ │ ┴ ┌ P",
     "├ ├ ─ . ├ ├ ┘",
     "┌ ─ ─ ─ ─ ┘ │",
     "S └ . ─ . ┴ .",
     "─ ┴ ─ ┬ ─ . ─",
     ". ┐ . ┘ . ┤ │"
    ],
    "src": "house",
    "note": "",
    "score": 25.3
   },
   {
    "name": "Bluebell Bend",
    "id": "lazy-patch",
    "rows": [
     ". S └ ┐ ┴ . ┐",
     "┐ ├ ┐ ┌ ├ ─ .",
     "# └ ┴ ─ ─ ┬ P",
     "┬ # ┐ ├ ┘ P └",
     "─ ┴ ┐ └ ─ . #",
     ". . ┬ ┼ ─ ┬ │"
    ],
    "src": "pond",
    "note": "",
    "score": 27.3
   },
   {
    "name": "April Showers",
    "id": "quiet-orchard",
    "rows": [
     "┼ │ ┌ # ┼ P ┌",
     "│ └ ┴ ─ . ┼ P",
     "┴ ┼ ─ # . │ └",
     "┘ ┤ # ┤ └ │ ┘",
     "┤ ─ ┴ ┼ ┐ │ .",
     "┬ ┬ ┐ . ┌ ┘ ┬",
     "┴ # ┘ ┐ S ├ ─"
    ],
    "src": "barrel",
    "cap": 8,
    "note": "",
    "score": 35.8
   }
  ]
 },
 {
  "name": "Summer Heat",
  "levels": [
   {
    "name": "Hot Pavement",
    "id": "twisty-patch",
    "rows": [
     "│ │ . ┼ . └",
     ". ├ │ ┌ ─ S",
     "┐ # ┌ ┘ . ─!",
     "┬ . │ ┌! ─! ┘!",
     ". ─ │ │! ┤ .",
     ". . P ┘! ├ ."
    ],
    "src": "barrel",
    "cap": 6,
    "note": "",
    "score": 24.7
   },
   {
    "name": "Dry Creek",
    "id": "twisty-spring",
    "rows": [
     "# # └ ┤ ┬ .",
     "┌! ─! ─! P ┐ ┤",
     "│! ┐ ┼ ┘ │ ├",
     "│! ┴ ┐ │ │ │",
     "─! ┐ └ ─ │ ├",
     "S ─ ─ ┬ ┘ ┘"
    ],
    "src": "barn",
    "note": "",
    "score": 26.9
   },
   {
    "name": "Sunflower Row",
    "id": "quiet-field",
    "rows": [
     "│ ┌ . . ┬ ┴ .",
     "┐ │ . ┌! ─! ─! ┐!",
     "┐ # ┴ │! P ┐ P",
     "┴ ┴ # │! ┤ └ ┤",
     "# ┌! ─! ┘! ┤ . │",
     ". │! ┬ ┬ └ ┐ │",
     "# ─! │ ┼ . ─ │",
     "┐ S ─ ─ ─ ─ ┘"
    ],
    "src": "barrel",
    "cap": 11,
    "note": "",
    "score": 27.2
   },
   {
    "name": "Lemonade Stand",
    "id": "quiet-trickle",
    "rows": [
     "┌! ─! P . ─ ┐",
     "│! ┬ │ # ┘ .",
     "│! ┌ │ ┬ # #",
     "─! . │ ─ . ┌",
     "S ┬ ┘ . . │",
     ". ┬ . . ┘ #"
    ],
    "src": "barrel",
    "cap": 7,
    "note": "",
    "score": 27.3
   },
   {
    "name": "Heat Haze",
    "id": "mossy-bend",
    "rows": [
     "┤ ┼ ┌ ─ ─ S",
     "┌ ─ ┘ ┌! ─! ┌!",
     "│ ┬ ┌! ┘! ┴ ┐",
     "├ │ │! ┴ ┘ ┼",
     "P ─! ┘! # └ #",
     "├ . └ ┘ ┤ ┬"
    ],
    "src": "well",
    "note": "",
    "score": 29.9
   },
   {
    "name": "Cracked Clay",
    "id": "shady-gully",
    "rows": [
     "┬ . ┌ . ┼ ┬ .",
     "┴ ┴ . ┼ ┘ ┼ ┐",
     "┌ ┴ ─ ─ ─ ─ ┐",
     "S │! ─! ┐! # ├ │",
     "┌ ┼ . │! ┌ ┴ │",
     "─ ┐ . └! ─! ─! P",
     ". ┤ └ ─ . ┤ ┐"
    ],
    "src": "barrel",
    "note": "",
    "score": 32.1
   },
   {
    "name": "Firefly Field",
    "id": "sunny-field",
    "rows": [
     "# S ─ ┐ ─ ┬ # ┴",
     "┘ ─! ┤ └ ┐ ┐ ┼ ─",
     "# │! ┐ ┤ └ ┐ ┘ │",
     "┼ │! . │ ┬ └ ┐ ┘",
     "│ │! ┼ . ┘ │ ├ ┐",
     "─ └! ─! ─! ─! ─! ┌! ┤",
     "│ ┬ ┴ ┐ └ │ │! │",
     "└ . ─ ─ ┐ ─ └! P"
    ],
    "src": "barrel",
    "cap": 15,
    "note": "",
    "score": 39.5
   },
   {
    "name": "Dog Days",
    "id": "shady-brook",
    "rows": [
     "└ ┤ # # ┘ │ ┤ ┤",
     "┴ ─ ┬ ┬ . ┤ ─ ├",
     "┘ . │ . ├ ┘ . └",
     "├ ┼ ┌ ─ ┬ P ─! ┐!",
     ". ┌ ┤ ┼ └ ─ P │!",
     "┴ │ ┌ ┴ ┼ ┌ ┌! ┘!",
     "# │ ├ ┌! ─! ─! ┘! └",
     "┤ S │! ┘! ┤ ┴ ┬ └"
    ],
    "src": "barrel",
    "cap": 11,
    "note": "",
    "score": 53.9
   },
   {
    "name": "Golden Hour",
    "id": "dewy-spring",
    "rows": [
     "├ ┴ P ─! ─! ┐! ┤",
     "┼ . │ # ┘ │! ┤",
     "┬ . │ # ┬ └! ┘!",
     "┼ . │ ─ ┐ ┘ S",
     "┼ ┌ ┼ ┴ ─ ─ ┘",
     "│ P ┬ . . . ─",
     "┴ # ┬ ├ ─ │ ─"
    ],
    "src": "barrel",
    "cap": 13,
    "note": "",
    "score": 57.8
   }
  ]
 },
 {
  "name": "Thirsty Cows",
  "levels": [
   {
    "name": "Milking Time",
    "id": "dusty-field",
    "rows": [
     "┴ ┐ ┴ ┌ ─ P",
     "├ ┌ # ├ P │",
     "┘ ├ ┌ ┘ ─ │",
     ". ┌ ┤ ┼ ┌ ┘",
     "# ├ ┘ C │ C",
     "┼ │ ┘ ─ ┘ .",
     "┘ └ S C ─ ."
    ],
    "src": "barrel",
    "cap": 13,
    "note": "",
    "score": 32.4
   },
   {
    "name": "Hay Bale Maze",
    "id": "bumpy-ditch",
    "rows": [
     ". . │ └ ├ #",
     "P ─ ┐ C ─ .",
     "│ . │ C ┤ ┼",
     "│ ├ │ C ┴ ┌",
     "└ ┐ └ ─ ┘ ─",
     ". ┴ ─ ─ S ."
    ],
    "src": "barrel",
    "cap": 9,
    "note": "",
    "score": 32.5
   },
   {
    "name": "Muddy Pasture",
    "id": "mossy-orchard",
    "rows": [
     "┌ ┐ . └ . ├",
     "└ ┼ . ─ │ ─",
     "─ ┤ ─ . ┬ .",
     "P ─ ┐ ┌ . ┤",
     "│ ┴ │ C ┬ └",
     "│ ─ └ ─ ┘ C",
     "└ ─ ┬ ─ S ."
    ],
    "src": "barrel",
    "cap": 8,
    "note": "",
    "score": 34.7
   },
   {
    "name": "Cowbell Crossing",
    "id": "windy-ditch",
    "rows": [
     "# ┴ ├ # P ┐",
     "┴ . . ┴ │ ┬",
     "│ ┌ ─ ┴ ┴ P",
     "┌ │ ─ # ┌ │",
     ". │ . C C │",
     "┬ │ ┌ ─ ─ ┘",
     "│ S └ . └ │"
    ],
    "src": "barrel",
    "cap": 10,
    "note": "",
    "score": 38.7
   },
   {
    "name": "Barnyard Gate",
    "id": "sunny-gully",
    "rows": [
     "┴ ┌ ─ ─ ─ ─ ┐",
     "┐ P ┌ P C # │",
     "┼ ├ ┘ . . ├ │",
     ". ├ P # . ┼ │",
     "┌ │ ┴ │ │ C │",
     "┴ └ ┐ ┤ . ├ ─",
     "┬ ┬ └ ─ ┴ ─ S",
     "┐ ┴ │ ┼ ┴ ┌ ┬"
    ],
    "src": "barrel",
    "cap": 13,
    "note": "",
    "score": 44.4
   },
   {
    "name": "Grazing Ground",
    "id": "thirsty-lane",
    "rows": [
     "┐ S ┐ ┼ ┬ . . .",
     "│ ─ └ ┐ ┐ ┴ ┼ .",
     "│ │ ┤ │ ┤ ┬ . ┴",
     "│ │ ┼ ├ ─ P ┐ ┤",
     "│ │ ┐ └ ┐ ┘ ┤ ┬",
     "│ └ ┬ ─ ├ P ┤ ─",
     "│ │ ├ ┴ P ┤ ┬ ┤",
     "└ ─ ─ ─ ┘ C ├ ┴"
    ],
    "src": "barrel",
    "cap": 9,
    "note": "",
    "score": 46.9
   },
   {
    "name": "Fence Line",
    "id": "pebbly-spring",
    "rows": [
     "│ ├ │ └ P . .",
     "# ┴ ┬ ┴ ├ P ┬",
     ". ┬ │ ┌ ┘ ┘ C",
     "┐ ┴ ┌ ┘ │ ┬ ┘",
     "┌ ├ ┘ ┐ │ C ┼",
     "# │ ┴ C │ ─ ─",
     "# S │ ─ ┘ ┴ ├"
    ],
    "src": "barrel",
    "cap": 10,
    "note": "",
    "score": 61.7
   }
  ]
 },
 {
  "name": "Hill Country",
  "levels": [
   {
    "name": "Switchback",
    "id": "crooked-corner",
    "rows": [
     "┌2 ┼2 ─2 ─2 ┬2 ┘2 #2",
     "┴2 ┤2 ┴2 ┬2 .2 .2 ├2",
     "S2 ┬2 ─2 ─2 ┐2 #2 .2",
     "┌2 ─2 ─2 ┐2 └2 ┐2 .2",
     "C2 ┘2 ┬2 │2 ┌2 │2 ┤2",
     "─2 │2 C2 │2 ┴2 ├2 P2",
     "├2 └2 .2 └2 ─2 P2 ┌2"
    ],
    "src": "river",
    "note": "",
    "score": 35.9
   },
   {
    "name": "Terrace Steps",
    "id": "thirsty-orchard",
    "rows": [
     "│2 S2 ─2 ─1 ┐1 ┌1 ┐",
     "┼2 ┌2 ─2 ┐1 └1 ┴p2 ┤",
     "┌2 │2 #2 │1 .1 ┼1 ┤",
     "┤2 ┴2 ┤2 │1 ├1 . │",
     "┘2 ┌2 .2 │ ┐1 ┴1 ┤",
     "┐ ┴ ┬ └ ┐ P ┤",
     "┤ .1 ┐1 C └ ┐ │",
     "┼ ┼ ├ . ┤ └ P",
     ". ┴ ┼ ┌ ┌ ┼ ┼"
    ],
    "src": "barrel",
    "cap": 13,
    "note": "",
    "score": 38.6
   },
   {
    "name": "Windy Ridge",
    "id": "mossy-trickle",
    "rows": [
     "┤2 ┌2 ┐2 ┤2 S2 └2 .2",
     "├2 ├2 ┤2 ┴2 │2 │2 ┘2",
     "┤2 ┬2 C2 ┌2 ┘2 │2 .2",
     "┤ ┴ ┐2 │2 ├2 ├2 ┌2",
     "─ ┌ ┌ ┘2 ┴2 │2 ┐2",
     "C1 ┌ ┘ . │1 │1 ┼1",
     "# P ┬ ─ ─1 ┤1 └1"
    ],
    "src": "barrel",
    "cap": 12,
    "note": "",
    "score": 38.9
   },
   {
    "name": "Lookout Point",
    "id": "misty-orchard",
    "rows": [
     "┐2 .2 P2 ┌2 ─2 ─2 P2",
     "┬2 ┌2 ┼2 ┘2 ┐2 .2 │2",
     "┌2 ┘2 ┌2 ┼2 C2 ┘2 │2",
     "│2 ┬2 ┴2 ┴2 ┌2 ─2 ┘2",
     "S2 │2 ─2 ─2 ┘2 ┤2 C2",
     "─2 ┤2 C2 #2 ─2 ┤2 ─2",
     "│2 .2 ─2 ┼2 .2 #2 └2",
     "└2 ┬2 ├2 ┼2 ┘2 │2 #2"
    ],
    "src": "pond",
    "note": "",
    "score": 40.3
   },
   {
    "name": "Sheep Trail",
    "id": "quiet-meadow",
    "rows": [
     ".2 ┼2 .2 .2 ┬2 ─2 └2",
     "┘2 C2 ├2 ┼2 ┘2 ┴2 ┼2",
     "P2 ─2 ─2 ┐2 C2 ─2 ┼2",
     "┤2 ┼2 ┬2 │2 ┐2 ┌2 ├2",
     "│2 ─2 └2 └2 ┐2 ┼2 ┤2",
     "└2 ┐2 .2 #2 ─2 C2 ─2",
     "┘2 └2 ─2 ─2 S2 └2 ┌2"
    ],
    "src": "barrel",
    "cap": 9,
    "note": "",
    "score": 40.4
   },
   {
    "name": "Rolling Downs",
    "id": "thirsty-ditch",
    "rows": [
     "┐2 ─2 ┘2 .2 ┬2 ┐2 ┼1",
     ".2 ┘2 .2 ┴2 ├2 ┼1 ┼1",
     "┴2 ┼2 ┤2 ┘2 ├2 ┼1 ┼1",
     "S2 ─2 ─2 ┐2 ┘2 .1 ┼1",
     "─2 └2 ┐2 └2 ┴2 ─1 ┐1",
     "│2 ┘2 .2 ┤2 .2 ┤1 │1",
     "└2 ─2 ─2 ┐2 C2 P1 ┤1",
     "└2 ─2 .2 └2 ─2 ┐1 │1",
     "#2 ┤2 .1 ┘1 ┘1 └1 P1"
    ],
    "src": "barrel",
    "cap": 12,
    "note": "",
    "score": 41.6
   },
   {
    "name": "Summit Spring",
    "id": "dewy-field",
    "rows": [
     "┤2 S2 │2 ─2 ─2 ┐2 ┘2 C1",
     "├2 │2 ─2 ┤2 C2 └2 ─2 ┐1",
     ".2 │2 ┼2 ┘2 #2 └1 ─1 │1",
     "┼2 └2 ─2 ─2 ─2 ┼1 ─1 P1",
     ".2 ┬2 ├2 .2 ┌2 │1 ─1 ┬1",
     "┤2 └2 │2 .2 .1 ┤p2 .1 .1",
     ".2 ├2 .2 ┼1 #1 │1 ┌1 ┬1",
     "┤2 └2 ┬1 ┬1 │1 P1 │1 #1"
    ],
    "src": "barrel",
    "cap": 15,
    "note": "",
    "score": 46.5
   }
  ]
 },
 {
  "name": "Cactus Patch",
  "levels": [
   {
    "name": "Prickly Path",
    "id": "shady-terrace",
    "rows": [
     "┬ ┴ ─ P ┐ ┘ .",
     "┤ ─ . X │ ┤ ┐",
     "└ . ┬ ┬ │ P ┤",
     "# ├ ┼ ─ └ ┤ │",
     "┐ │ │ └ │ │ X",
     "│ # ─ ─ ┬ │ │",
     "# ┴ ┼ ┌ ─ ┴ ├",
     ". S ─ ┘ ┴ X └"
    ],
    "src": "barrel",
    "cap": 14,
    "note": "",
    "score": 36.6
   },
   {
    "name": "Tumbleweed",
    "id": "sunny-patch",
    "rows": [
     "└ ┐ # ┬ ─ S │",
     "┘ X ┌ ┘ ┼ ─ C",
     "┤ ┬ ┘ ─ ─ │ ┴",
     "X │ ┼ . ┌ ┘ ├",
     "┌ │ │ │ │ . .",
     "┼ ├ ─ P │ . ─",
     "┐ └ P ─ ┘! │ ."
    ],
    "src": "barrel",
    "note": "",
    "score": 43.4
   },
   {
    "name": "Desert Bloom",
    "id": "sleepy-terrace",
    "rows": [
     "│ . # ┐ ┘ ┬ .",
     "└ ┬ # P ─ ┴ ┴",
     "┤ ┌ P ┴ ─ ┤ X",
     "│ └ . │ │ ├ ┐",
     "┴ ┘ ┐ . ┘ └ ┤",
     "┬ ┬ # ┴ └ . S",
     "┼ ┘ . ─ . ┴ ┐",
     "┌ └ ┘ └ ├ ┬ ┬"
    ],
    "src": "barrel",
    "cap": 9,
    "note": "",
    "score": 43.9
   },
   {
    "name": "Dry Wash",
    "id": "dusty-spring",
    "rows": [
     "│ └ ├ . ┤ ┴ ┬",
     ". . . P ┬ P #",
     "│ ┌! ─ ┘ │ ┴ └",
     "├ │ ┤ ┤ │ X ┐",
     "# │! C ┤ ┤ ├ ─",
     "C ─ ┤ ┌ ┘ ┴ │",
     "┐ S ─ ┘ X ├ └"
    ],
    "src": "barrel",
    "cap": 10,
    "note": "",
    "score": 46.2
   },
   {
    "name": "Mesa Top",
    "id": "sleepy-patch",
    "rows": [
     "┘ ┘ ├ ┤ ┤ # ─",
     "├ . . ┼ P ┼ ┘",
     "┴ ┤ . └ │ ┼ │",
     "X X ┴ ┬ │ # ┐",
     "┌ ─ ┴ ─ ┼ ┐ ┌",
     "S │! ─! ┐ ┌ └ ┐",
     "┬ ─ . └ ─ ─ P",
     "│ . . │ C C ┼"
    ],
    "src": "pond",
    "note": "",
    "score": 46.6
   },
   {
    "name": "Roadrunner Run",
    "id": "shady-orchard",
    "rows": [
     "┼ ├ ┐ S ┬ ┐ │ ┤",
     "┴ ┼ ┐ . ┴ ┤ ┼ ┤",
     "│ ┼ ┼ ┼ ┼ │ ┘ ┴",
     "┘ ┤ ┼ └ # └ ┐ ┌",
     "┘ ─ . ├ . ├ ├ ┐",
     "└ # ┘ ┘ ┬ │ ┼ P",
     "┘ # P ─ ─ ─ ┘ X"
    ],
    "src": "barrel",
    "cap": 18,
    "note": "",
    "score": 46.7
   },
   {
    "name": "Sandy Spines",
    "id": "crooked-patch",
    "rows": [
     "# X ┼ # ┼ ┼ ┐",
     "┌ ┼ ┴ ├ ─ ─ ┐",
     "P ┬ ┴ ┘ ┤ └ │",
     "└ ┤ X ┌ ┌ │ S",
     "│ │ X ┬ . . ┬",
     "P │ ┤ ─ ┼ ┘ ┌",
     "└ ┤ X ┴ ┤ ┼ ├",
     "P ┘ ┴ ─ . . ┘"
    ],
    "src": "barrel",
    "cap": 19,
    "note": "",
    "score": 46.9
   },
   {
    "name": "Agave Alley",
    "id": "lazy-spring",
    "rows": [
     "┤ ┘ ─ ─ ┌ P .",
     ". └ ┼ ├ ┴ ─ P",
     ". ├ X │ ┘ ┘ .",
     ". ├ X │ ┤ │ ┤",
     "├ ┤ ┐ │ ┼ # .",
     "─ # # ┤ ┌ ┴ ┬",
     "─ │ X │ ┴ . └",
     "┐ ┌ ┤ └ S # ."
    ],
    "src": "barrel",
    "cap": 14,
    "note": "",
    "score": 47.6
   },
   {
    "name": "Coyote Creek",
    "id": "windy-meadow",
    "rows": [
     "C ┌ ─ ─ ─ ─ ┐ C",
     "┌ P ┬ ┐ ┼ ┐ │! └",
     "┤ X ├ ┼ ─ ┐ │! ┬",
     "P ┬ ┴ ┘ ┴ │ └ ┐!",
     "─ P ┬ ┌ X ├ ┐ │",
     "┬ ┼ ┴ # ┐ ┬ │ │",
     "┐ ├ ┬ ┼ ┬ ┤ ┤ │",
     "┬ ┼ . ┌ ┼ . S └"
    ],
    "src": "barrel",
    "cap": 18,
    "note": "",
    "score": 62.4
   },
   {
    "name": "Painted Rock",
    "id": "twisty-puddle",
    "rows": [
     "┴ ┴ X X ┘ ┘ P ┘",
     "┌ ┴ ┬ ─ ┴ ─ ┼ ├",
     "S │ # X ┼ └ └ ┐",
     "─! C ┐ ┘ ┐ ┘ ┬ │",
     "│ ┤ ┤ ├ ┼ ┬ ┌ ┤",
     "└ ┐ │ ┴ ┼ ┼ │ P",
     "┌ └ ─ ┐ ┌ ┬ │ │!",
     "└ ┬ C └! ┐! . P │",
     "┼ │ └ ┼ └ ─! ─ ┘"
    ],
    "src": "pond",
    "note": "",
    "score": 70.9
   }
  ]
 },
 {
  "name": "Potting Shed",
  "levels": [
   {
    "name": "Seed Trays",
    "id": "dewy-ditch",
    "rows": [
     "# ┴ ┐ . ┘ P .",
     "S ┴ ─ ┐ . │+ .",
     "─ ┬ ┘ ├+ ─ ┘ ┼",
     "│ C ┴ │ ─ │ │",
     "└ ┐ │ │ _ ┬ ┌",
     "C │ . │ ┘ . ┬",
     "C └ ─ P └ . ."
    ],
    "src": "barrel",
    "extra": [
     "┐"
    ],
    "note": "",
    "score": 37.3
   },
   {
    "name": "Clay Pots",
    "id": "dusty-brook",
    "rows": [
     "P ─ ─ ┬ ┬ P ┤",
     "┤ ┼ ─ │ │ ┼ ┴",
     "┤ ├ P ┴+ ┴+ ┐ ├",
     "┤ ├ │ ─ └ └ ┐",
     "# ┌ │ ├ ┌ ┼ │",
     "┤ C └ ─ ─ ┘ │",
     "┬ ├ ┬ C ┤ S ┘"
    ],
    "src": "barrel",
    "extra": [
     "┐"
    ],
    "cap": 14,
    "note": "",
    "score": 37.9
   },
   {
    "name": "Garden Gloves",
    "id": "crooked-spring",
    "rows": [
     "┤ S . . ┘ ┘",
     "│ │ ┴ . │ ┼",
     "┼ │ _ │ _ ┴",
     "# ├ ─+ ┬+ ─ P",
     "┬ ┬ ─ P # .",
     "# ┼ ├ # . ┴",
     "┐ └ ┌ ─ ┐ ┐"
    ],
    "src": "barrel",
    "extra": [
     "└"
    ],
    "cap": 8,
    "note": "",
    "score": 45.8
   },
   {
    "name": "Trowel and Twine",
    "id": "dewy-gully",
    "rows": [
     "┐ # S ┼ . .",
     ". ┐ └ ┐ ─ ┬",
     "┼ │ ┬ │ . ┌",
     ". └ ┐ ┼ ┬ .",
     ". . _ │+ P #",
     ". ─ ┼ │+ _ ┌",
     ". . ┼ └ P ┴"
    ],
    "src": "barn",
    "extra": [
     "┘"
    ],
    "note": "",
    "score": 47.4
   },
   {
    "name": "Watering Can",
    "id": "dusty-terrace",
    "rows": [
     "┌ ┌ ─ ─ S └",
     "┬ │+ ┬ ┐ ─ ┌",
     "┌ ┤+ └ │ │ ┼",
     "├ ┘ ┌ ┌ │ ┐",
     "│ ┐ ─ ┌ ┘ ┘",
     "│ ┬ C │ ┘ .",
     "├ P ┌ ┘ │ ┴",
     "P ─ ┘ ┤ . ├"
    ],
    "src": "barrel",
    "extra": [
     "┘"
    ],
    "cap": 11,
    "note": "",
    "score": 52.6
   },
   {
    "name": "Seedling Shelf",
    "id": "mossy-spring",
    "rows": [
     "┤ P ┬ . ┼ ┼",
     ". │ ┤ └ ┬ ┴",
     "├ └ ┬ ┴ ─ S",
     "┌ ┬ ┘+ ┬ _ ┌",
     "│ P ┤ └ . ┴",
     "P └ ┘ ┼ # ─"
    ],
    "src": "barrel",
    "cap": 11,
    "note": "",
    "score": 52.7
   },
   {
    "name": "Compost Corner",
    "id": "mossy-lane",
    "rows": [
     "S ┬ ┐ ┐ ┌ . .",
     "┬ ┬ └ ┐ # ┤ ┤",
     "┴ ┤ │ └ ┐ ┤ ┘",
     "┼ ─ _ _ ├ P ┴",
     "│ ┐ ┬ ┘ └+ ─ P",
     "─ ┐ ├ # ┬ ┴ ┼",
     "┘ # │ ┌ ┘ │ ─",
     ". # . └ ┘ └ ┐"
    ],
    "src": "barrel",
    "extra": [
     "└",
     "┘",
     "─"
    ],
    "cap": 11,
    "note": "",
    "score": 53.3
   },
   {
    "name": "Bulb Box",
    "id": "quiet-terrace",
    "rows": [
     "┐ # ┤ │ ┴ │ S",
     "┐ ┘ # . _ ┬ ┘",
     "│ ─ │ . # ├ ┌",
     "┴ ┼ ┬ ┼ ┼ │+ #",
     ". ┘ ┬ ┤ ┌+ ┘ ┴",
     "┘ ┴ ┼ ┌+ ┤ _ ┬",
     "├ ┴ P ┘ P . │"
    ],
    "src": "barrel",
    "extra": [
     "┘"
    ],
    "cap": 13,
    "note": "",
    "score": 53.9
   }
  ]
 },
 {
  "name": "Clockwork Garden",
  "levels": [
   {
    "name": "Tick Tock",
    "id": "bumpy-corner",
    "rows": [
     "├ ┼ . P ─ ┘ ┬ .",
     "┌a ─b ─ ┴b ─a ─c ┐ ┴",
     "│ ┼ │ . ┼ ┌ P └",
     "│c ┌ ─ ─ ─ ┘ ┌ ┬a",
     "S └ C ┤ ┐ ─ ┌ │",
     ". C ┤ ┘ # ┤ ─ ┌",
     "└b ├ ┼ ┴ ┐ . . ┼",
     ". ┴ │c ┼ ┴ . . ."
    ],
    "src": "barrel",
    "cap": 9,
    "note": "",
    "score": 27.8
   },
   {
    "name": "Gear Garden",
    "id": "dusty-corner",
    "rows": [
     ". ┌ S . ┴ ┌ ┐",
     "│b ├b ┼ # ┼ ┘ ┴",
     ". │ ┬ # ┴ ┼ ┴",
     "┌ ┼ ─ ─ ┴a ┬ ┐a",
     "│b ┬ . ┌ ┼a P │",
     "│ . │ # . . │",
     "P │ ┬ ┤ │ ┼ P"
    ],
    "src": "pond",
    "note": "",
    "score": 45.5
   },
   {
    "name": "Cuckoo Clock",
    "id": "sleepy-hollow",
    "rows": [
     "└ ┐ S ─ ─ ┐ . .",
     "┌a ┼ ─ ┴ ┤ │a ┼ ┤",
     "# ┼ ┼ │ . │ └ ┘",
     "┤ ┴ . │ . │a ─ ┤",
     "┌ ┘ ─ # ┌ ┴ ┐ └",
     "P ─ ─b ─ ┤b ┼ P ├",
     "┼ . ┘ ─ ┌ ┘ ─ ┘",
     "┼ ┤ │b # ┴ . . ┘"
    ],
    "src": "barrel",
    "note": "",
    "score": 46.2
   },
   {
    "name": "Sundial",
    "id": "quiet-brook",
    "rows": [
     ". ┐ . ┌ P ┘ .",
     "┼ ┬ . ┐ │ ├ ┴",
     "┐a │ . ─ │ │ ─",
     ". . ┌ │ │ ┤ │",
     "┴ │ ┘b ┬ │b . .",
     "S ─ ─ ─ ┼a ─ ┬",
     "┬ ┌ ┌ ├ ─ ├ │",
     "┴ . ┼ ┴ └ . P"
    ],
    "src": "barrel",
    "note": "",
    "score": 49.4
   },
   {
    "name": "Wind-Up Way",
    "id": "lazy-terrace",
    "rows": [
     "# ├ ┤ # ┬ │b ┤",
     "└ ┴ P ┬ ┬ . ┬",
     "┼ . │ . ┘ ┴ ┘",
     "┘ ├ ┴a ┴ ─ ─ S",
     "┌ ┘ ─ ├a . ┌ ─",
     "│b # ┌ ┼ ┌ ┌ ┘",
     "P ─ ─ ─ ─ ┘ C"
    ],
    "src": "barrel",
    "note": "",
    "score": 49.8
   },
   {
    "name": "Pendulum Path",
    "id": "quiet-patch",
    "rows": [
     "┐ S ├ . . ├ #",
     "┐ │ . ┐ . . ┼",
     "┤b ├b ├ ┘ │ ├ └",
     "┼ │ . ┤ . ┌ #",
     "├ └ ┐ ┐a . ┘ ┌",
     "│ . ┼ ─ ┬a P ┬",
     "┌ ─ └ ┐ # ┘ ─",
     "┐ ┐ ┬ P ─ ┐ ┴"
    ],
    "src": "barrel",
    "cap": 16,
    "note": "",
    "score": 53.3
   },
   {
    "name": "Cogwheel Court",
    "id": "pebbly-patch",
    "rows": [
     "┴ │ ┘ # ┼ ─ P",
     "┌a ─ ─ ┐ ┬b . │",
     "S # ┬ └ ┬ ─a ┴b",
     "└a └ ┐ ┴ │ ┘ ┼",
     "C └ ─ ┐ ├b ┐ ┐",
     "┬ ┘ │ └ P │ ┤",
     "│ └ ┌ ┬ │ P .",
     "┘ ─ ┬ # ┌ ┌ ┘"
    ],
    "src": "barrel",
    "cap": 20,
    "note": "",
    "score": 60.6
   },
   {
    "name": "Spring Loaded",
    "id": "pebbly-hollow",
    "rows": [
     "S ┬a ┌ ─ ┐ . . .",
     ". └c ┐ ┴ ┼ # │ ┘",
     "─ ┐ ┴ ─ ─b ┼b ─c P",
     "┬ ┼ ┬b ─ . ┤ ┼a │",
     "┬ ─ # ┼ ┐ │a ┐ .",
     "└ │ ─ # . P ─ └",
     "│ ┤ ─c ┼ . ┐ ┘ .",
     "┘ ┌ │ ├ ┌ ├ ┼ ."
    ],
    "src": "barrel",
    "cap": 18,
    "note": "",
    "score": 60.8
   },
   {
    "name": "Clock Tower",
    "id": "mossy-ditch",
    "rows": [
     "│ ┐c │ P ┼ ┬ ─",
     "# ┬b ┴a ├ P C ┤",
     ". . ┼ ├ └a ┐ .",
     "│ ├ . │b ┘ │ ┬",
     "┌ ─ ─b ┤ └ └ ┐",
     "P . ┴b │ ├ ┴ │",
     "├ # │c │c ┴ ┼ ─",
     "┤ . ─ └a ─a ┬c S"
    ],
    "src": "barrel",
    "cap": 16,
    "note": "",
    "score": 64.7
   },
   {
    "name": "Midnight Chime",
    "id": "sleepy-ditch",
    "rows": [
     "┬ ─ ┌ ┐ ├ ├ P │",
     "P ─ ┴a ┴ ┬ ┬ ┤ ┴a",
     "│ │c ┼ ┼c P ┘ ├a └",
     "└ ┐ └ ┤ ─ ─b │b ┬",
     "C │ C . . ┼ ├ ┐c",
     "┘ └ ─ ─ ┐ # ┐b │c",
     "┼ ┤ ┤ ┤ └ ┐ ┼ │b",
     "┴ # ┌ └ . └a │ S"
    ],
    "src": "barrel",
    "cap": 19,
    "note": "",
    "score": 67.3
   }
  ]
 }
];
