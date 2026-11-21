# Rain Barrel

A cozy water-routing puzzle game. Turn the channels to get water from the rain barrel to every thirsty plant, before the water runs out. It's the second game in the Carrot Patch family, after [Carrot Patch Defense](https://github.com/lunde367/carrot-patch-defense), and is built on the same shared kit.

## Play

```
npm run dev        # then open http://localhost:5173
```

(Or serve the `web/` folder with any web server, e.g. `python3 -m http.server -d web`. It uses JavaScript modules, so opening the file straight from disk won't work.)

**Test mode:** tap the game title 7 times quickly, or add `#dev` to the end of the link. This unlocks every level, adds a Solve button and shows the Level Lab. Tap the title 7 times again to turn it off.

## How the code is laid out

| Folder | What's in it |
| --- | --- |
| `web/` | Everything the player gets. This folder becomes the app and the website. |
| `web/kit/` | The shared family kit from Carrot Patch Defense: styles, sound, effects, save, ads, rating question, tutorial bubbles, test mode. Keep it in sync between the games. |
| `web/css/game.css` | Rain Barrel's own layout. It uses the same class names as Carrot Patch. |
| `web/js/data/levels.js` | Worlds and levels. Levels are written in their solved state, and the game scrambles them. |
| `web/js/data/shed.js` | Puzzle Shed bonus levels (made by the generator, part of the real game). |
| `web/js/data/lab.js` | Levels made by the generator. They show only in test mode, under **Level Lab**. |
| `web/js/data/config.js` | Version, ad IDs, hints and hint jar settings. |
| `web/js/engine/flow.js` | The water rules: flow, leaks, cows, hills, pumps, cacti and barrel size. |
| `web/js/engine/game.js` | Playing one level: turning and placing pieces, undo, hints, and the win check. |
| `web/js/render/board.js` | Draws the board on a canvas in the family art style. |
| `web/js/ui/` | Home screen, controls, tray, results and test mode. |
| `web/privacy.html`, `web/support.html` | The privacy and help pages the stores link to. |
| `tools/check-levels.mjs` | Checks that every level can be solved and doesn't start out solved. |
| `tools/levelgen/` | The level generator: solver, difficulty rater, strategy patterns and the difficulty plan. |
| `tools/test/first-play.mjs` | A robot plays the game from a brand-new save, like a first-time player. |
| `tools/icons/`, `tools/store/` | Draw the app icon and splash screens, and make the store screenshots. |
| `store/` | Store listing text, publishing checklist, screenshots and feature graphic. |
| `assets/` | The icon and splash pictures the app build uses. |
| `capacitor.config.json` | App name and ID for the stores. |

## Put it online (free, for play-testing on any phone)

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Every push to `main` publishes the game at https://lunde367.github.io/rain-barrel/ (the workflow downloads the fonts automatically).

## Turn it into an app

The setup matches Carrot Patch Defense: a plain web game wrapped with Capacitor for iPhone and Android.

**Without setting anything up:** the "Build phone apps" workflow (repo → Actions) builds both apps in the cloud on every app-related push, or when you press *Run workflow*. It gives you an installable Android test app (also posted at a plain download link on the repo's "Android test app" release), checks that the iPhone app builds, and makes fresh store screenshots with the real fonts.

**On your own machine** (Node 20+; a Mac with Xcode for iPhone, Android Studio for Android):

```
npm install
npx cap add ios               # creates the ios/ project (once)
npx cap add android           # creates the android/ project (once)
npm run app:prepare           # fonts, icons and splash screens, portrait lock, version number, sync
npm run ios                   # copies web/ in and opens Xcode
npm run android               # copies web/ in and opens Android Studio
```

After any change in `web/`, run `npm run sync` (or `npm run ios` / `npm run android`).

**Before publishing,** work through [`store/README.md`](store/README.md): the App ID (`com.example.rainbarrel` must change before `npx cap add`), real ad IDs, the listing text, the store forms and the release builds.

To redraw the icon or splash: edit `tools/icons/art.html`, serve the project root (`python3 -m http.server 8767`), run `npm run icons`, then `npm run assets`.

## Checks

```
npm run levels     # every level solvable, none start solved
npm test           # the level check, then the first-time player robot (needs Playwright)
```

Both also run on GitHub on every push.

## Writing levels

Rows in `web/js/data/levels.js` use these symbols:

- `S` water source, `P` plant, `X` cactus (must stay dry), `#` rock, `C` cow, `_` empty slot, `.` grass
- Channel pieces: `─ │ └ ┌ ┐ ┘ ├ ┤ ┬ ┴ ┼`
- Marks after a symbol: `*` locked, `!` sun-baked (costs 3 drops), a digit for hill height, `p` windmill pump, `+` the piece starts in the tray (its tile becomes an empty slot), `a`–`d` linked group (turns together)
- `extra` on a level adds spare pieces to the tray; `src` picks the water source
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
  - *Stay-dry cactus:* cacti beside the route, so a piece turned the wrong way pours onto one.
  - *Tray pieces:* some route pieces start in the tray, with extra empty slots and spare pieces.
  - *Linked pieces:* a few pieces turn together, so fixing one can break another.
- **`curriculum.mjs`** is the difficulty plan: board size, number of plants, patterns and target score for each world, from its first level to its last. The generator checks the plan's rules: levels get harder within a world; each world ends harder than the one before; a new world starts only moderately easy (its first level at least 60% of the way up the previous world's range, set by `START_AT`); and every level in a world uses that world's mechanic.

Commands:

```
node tools/levelgen/rate-levels.mjs     # difficulty report for every level in the game
node tools/levelgen/generate.mjs        # make a new Level Lab (add a number for a different batch: generate.mjs 7)
node tools/levelgen/generate.mjs --shed # remake the Puzzle Shed bonus levels (part of the real game, so only on purpose)
```

Worlds marked `preview` in the plan (Cactus Patch, Potting Shed, Clockwork Garden) try out the newer mechanics and skip the ordering rules until we decide where they go.

## Stars

- Stars open the next world (see `need` in `web/js/data/levels.js`).
- The **Puzzle Shed** holds hard bonus levels, each opening at a total number of stars from the main worlds (`needTotal` in `web/js/data/shed.js`).
- The **hint jar**: every level finished with 3 stars for the first time adds a hint, up to 5 (`JAR_MAX` in `web/js/data/config.js`). Jar hints are used after the free hint and before any ad.

`generate.mjs` writes `web/js/data/lab.js` and `tools/levelgen/report.md`. Play the Lab in test mode, and copy the levels you like into `web/js/data/levels.js`.
