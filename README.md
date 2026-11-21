# Rain Barrel

A cozy water-routing puzzle game. Turn the channels to get water from the rain barrel to every thirsty plant, before the water runs out. It's the second game in the Carrot Patch family, after [Carrot Patch Defense](https://github.com/lunde367/carrot-patch-defense), and is built on the same shared kit.

## Play

Open `index.html` through any web server. It uses JavaScript modules, so opening the file directly from disk won't work. For example:

```
python3 -m http.server
```

Then go to http://localhost:8000.

**Test mode:** tap the game title 7 times quickly, or add `#dev` to the end of the link. This unlocks every level and adds a Solve button. Tap the title 7 times again to turn it off.

## How the code is laid out

| Folder | What's in it |
| --- | --- |
| `kit/` | The shared family kit, copied unchanged from Carrot Patch Defense: styles, sound, effects, save, ads, tutorial bubbles, test mode. Keep it in sync between the games. |
| `css/game.css` | Rain Barrel's own layout. It uses the same class names as Carrot Patch. |
| `js/data/levels.js` | Worlds and levels. Levels are written in their solved state, and the game scrambles them. |
| `js/engine/flow.js` | The water rules: flow, leaks, cows, hills, pumps and barrel size. |
| `js/engine/game.js` | Playing one level: turning pieces, undo, hints, and the win check. |
| `js/render/board.js` | Draws the board on a canvas in the family art style. |
| `js/ui/` | Home screen, controls, results and test mode. |
| `tools/check-levels.mjs` | Checks that every level can be solved and doesn't start out solved. |
| `tools/levelgen/` | The level generator: solver, difficulty rater, strategy patterns and the difficulty plan. |
| `js/data/lab.js` | Levels made by the generator. They show only in test mode, under **Level Lab**. |

## Writing levels

Rows in `js/data/levels.js` use these symbols:

- `S` rain barrel, `P` plant, `#` rock, `C` cow, `.` grass
- Channel pieces: `─ │ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼`
- Marks after a symbol: `*` locked, `!` sun-baked (costs 3 drops), a digit for hill height, `p` windmill pump
- `cap` on a level sets how many drops the barrel holds

After changing levels, run:

```
node tools/check-levels.mjs
```

## Level generator

The generator in `tools/levelgen/` makes new levels that follow rules we set, so we can make lots of levels and pick the best ones.

- **`solver.mjs`** finds the best way to water every plant. It follows the water, so it only tries pieces water can reach, which keeps it fast on big boards. It uses the game's own water rules.
- **`rate.mjs`** gives a level a difficulty score from how many routes a player could try, how many pieces and decoys there are, how many "trap" routes work but waste water, which mechanics are in play, and how many best answers there are. The weights are at the top of the file. Tune them as playtesting shows what really feels hard.
- **`patterns.mjs`** holds the strategy patterns the generator mixes:
  - *Decoy shortcut:* the obvious short route is quietly ruined by cows, sun-baked tiles or a rock, so the real answer is a longer route.
  - *Decoy fill:* extra pieces on empty grass, so there are more ways to go wrong.
  - *Locked anchor:* a few route pieces are stuck in place, giving a starting point. Makes early levels easier.
  - *Sun-baked patch:* some decoys cost 3 drops.
  - *Hills (+ pump):* the real route only runs downhill, with a windmill pump where it must climb.
  - *Limited barrel:* the barrel holds exactly enough for the best route, so wasteful routes fail outright.
- **`curriculum.mjs`** is the difficulty plan: board size, number of plants, patterns and target score for each world, from its first level to its last. The generator checks the plan's rules: levels get harder within a world; each world ends harder than the one before; a new world starts only moderately easy (its first level at least 60% of the way up the previous world's range, set by `START_AT`); and every level in a world uses that world's mechanic.

Commands:

```
node tools/levelgen/rate-levels.mjs     # difficulty report for every level in the game
node tools/levelgen/generate.mjs        # make a new Level Lab (add a number for a different batch: generate.mjs 7)
```

`generate.mjs` writes `js/data/lab.js` and `tools/levelgen/report.md`. Play the Lab in test mode, and copy the levels you like into `js/data/levels.js`.
