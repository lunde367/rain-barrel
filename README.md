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
