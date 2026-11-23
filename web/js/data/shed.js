// Puzzle Shed: bonus levels made by tools/levelgen/generate.mjs --shed (seed 3).
// These are part of the real game (stars are saved for them), so only regenerate on purpose.
// cap = the best route's water plus 2 spare drops (one leak's worth), so a bonus level is tough, not unforgiving.
// needTotal = total stars from the main worlds needed to open the level.
export const SHED = [
 {
  "name": "Toolbox",
  "id": "shed-twisty-lane",
  "rows": [
   "┌ ┌ ─ ─ ─ S . .",
   "┬ ┼ ├ # │ ─! ─ .",
   "│ │ ┬ └ . │ . ┴",
   "P │ └ ─ # │ . ├",
   "│ P . ─ │ │! . #",
   "└ ─ ─! ─ ─ ┘ C └",
   "C ├ C # ┬ ┤ ┬ .",
   "# │ . . └ │ ┐ ─",
   "┘ ┤ ├ ┘ ┐ ┬ ┼ ┬"
  ],
  "src": "barrel",
  "cap": 15,
  "note": "A bonus puzzle for star collectors.",
  "needTotal": 40
 },
 {
  "name": "Rusty Hinges",
  "id": "shed-quiet-hollow",
  "rows": [
   "├ P ┌ ─ ─ P └ ┴",
   ". ├ ┘ . . │ └ .",
   "┬ │ # ┼ . │ . ┤",
   "├ │ ┌ ─ # │ └ ┤",
   "│ │ ┐ ┌ ─ ┘ ┬ ┬",
   "┌ │ ┌ ┘ C ┼ └ ┌",
   "─ ├ │ ┬ . └ ┴ ─",
   ". │ │ │ . ┐ ┤ ┼",
   "┘ S └ │ . ┤ ┴ ├"
  ],
  "src": "barrel",
  "cap": 15,
  "note": "A bonus puzzle for star collectors.",
  "needTotal": 80
 },
 {
  "name": "Cobweb Corner",
  "id": "shed-mossy-lane",
  "rows": [
   "┘ S ─ ─ ┐ . ┼ ┼",
   "└ ─ # ┬ └ ─ ┬ ├",
   "┐ │ ┴ . # ┴ │ .",
   "┌ │ ┐ ─ └ ├ ┼ ├",
   ". │ ┼ ─ │ │ P ─",
   "┤ └! ┐ ┌ ├ │ │ .",
   ". . │ C P ┘ │ .",
   "│ . └ ─ ─ ─! ┘ ┤",
   "└ ├ ├ ┬ ┐ ├ ┌ ┤"
  ],
  "src": "barrel",
  "note": "A bonus puzzle for star collectors.",
  "needTotal": 120
 },
 {
  "name": "Potting Bench",
  "id": "shed-lazy-terrace",
  "rows": [
   ". . ┌ ┬ P ┴ └ └",
   "┤ ┼ ├ . │ ─ . #",
   "┌ ─ ┬ ┬ ┴ P │ ┴",
   "│ │ └ ┘ ┌ ┘ C ├",
   "│ ┌ ─ ─! ┘ C . .",
   "┤ │! ├ . C ┼ . ┬",
   "S └! ┤ ├ . │ ┤ ┘",
   "─ ┐ . . . ┼ ┬ └",
   "│ ┼ └ └ ├ . ┤ ┘"
  ],
  "src": "barrel",
  "cap": 15,
  "note": "A bonus puzzle for star collectors.",
  "needTotal": 160
 },
 {
  "name": "Lantern Light",
  "id": "shed-thirsty-spring",
  "rows": [
   "┼ ├ S │ │ └ ┼ │",
   "┤ │ ─ └ ┬ ─ . ┤",
   "├ │ │! ├ ┘ ┐ ┼ ├",
   "│ │ │ ┴ ┌ ┼ ─ ┬",
   "┐ ├ │! C ┐ ┼ ─ ┘",
   "┌ │ │ C ┐ └ # │",
   ". │ └ ┐ ─ │ ├ #",
   "┤ │ . │ ┐ . ┌ ┼",
   "─ └ ┼ P ┌ P ┤ ┘",
   "┬ ┼ └ ─ ┘ ┬ . └"
  ],
  "src": "barrel",
  "cap": 22,
  "note": "A bonus puzzle for star collectors.",
  "needTotal": 200
 }
];
