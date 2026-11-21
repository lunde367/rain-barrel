# Rain Barrel: store listing and publishing checklist

Everything needed to put Rain Barrel on the Apple App Store and Google Play. Pictures are in this folder
(`screenshots/`, `feature-graphic.png`); remake them with `npm run store` (see `tools/store/make.cjs`), or
download the fresh set the "Build phone apps" workflow makes with the real fonts.

Store rules change. Before each submission, check the screenshot sizes, target Android version and
form answers against the stores' own pages.

## Decisions to make first

- [x] **App ID:** `com.kitchentablegames.rainbarrel`, matching Carrot Patch Defense
      (`com.kitchentablegames.carrotpatch`): every game in the family ships under Kitchen Table Games.
      It can never change after the first release.
- [ ] **Name.** Check that "Rain Barrel" is free on both stores (search them). A fallback is
      "Rain Barrel: Water Puzzle".
- [ ] **Who it's for.** If you tell Google Play the game is meant for children under 13 as well, it falls
      under Google's Families policy, and the ads must be set up for children (no personalized ads).
      The simplest path is to target ages 13 and up while keeping the game family-friendly; Carrot
      Patch Defense should make the same choice.
- [ ] **Real ad IDs.** `web/js/data/config.js` uses Google's test ad IDs. Before release, make a
      Rain Barrel app in AdMob, put its app ID and rewarded ad unit IDs there, and set `testing: false`.

## Listing text (both stores)

**App name:** Rain Barrel

**Subtitle (App Store, 30 characters max):** A cozy water-routing puzzle

**Short description (Google Play, 80 max):** Turn the channels, water every plant. A cozy puzzle for the whole family.

**Promotional text (App Store, 170 max):**
Turn the channels and get water from the rain barrel to every thirsty plant. Watch out for leaks, hungry cows and hills!

**Description:**

> Rain Barrel is a cozy water puzzle. Every level is a little garden with thirsty plants and a source of water: a rain barrel, a pond, a river or an old well. Tap the dirt channels to turn them, and the moment they line up, water rushes along and the plants burst into bloom.
>
> It starts gentle and gets cleverer:
> • Leaks waste water, so every opening has to meet another.
> • Sun-baked tiles soak up extra drops.
> • Cows drink from any channel that runs past them.
> • Some barrels only hold a few drops, so wasteful routes run dry.
> • Water only flows downhill, unless a windmill pump lifts it.
>
> Earn up to 3 stars on every level by using as little water as you can and solving it in few moves. Stars open new gardens, and the hardest puzzles wait in the Puzzle Shed for true star collectors.
>
> • Play any level in a garden in any order once you've learned the basics
> • Stuck? The first hint in every level is free, and every 3-star level saves another hint
> • No timers and no lives: take your time
> • Ads only play when you choose to watch one for an extra hint, never between levels
> • Made for the whole family

**Keywords (App Store, 100 characters max):**
`puzzle,water,pipes,plumber,flow,garden,connect,logic,brain,cozy,relaxing,family,plants`

**Category:** Games › Puzzle (App Store secondary: Games › Family). Google Play: Game › Puzzle.

**URLs** (after GitHub Pages is on, see the main README):
- Privacy policy: `https://lunde367.github.io/rain-barrel/privacy.html`
- Support: `https://lunde367.github.io/rain-barrel/support.html`
- Marketing site: `https://lunde367.github.io/rain-barrel/`

**Copyright:** © 2026 Kitchen Table Games

## Pictures

| Store | Files | Size |
| --- | --- | --- |
| App Store, iPhone with Dynamic Island, medium display (required) | `screenshots/iphone-medium/` | 1206 × 2622 |
| App Store, iPhone large display (optional) | `screenshots/iphone/` | 1290 × 2796 |
| App Store, iPad 13" (required, the app runs on iPad) | `screenshots/ipad/` | 2048 × 2732 |
| Google Play, phone | `screenshots/android/` | 1080 × 1920 |
| Google Play, feature graphic | `feature-graphic.png` | 1024 × 500 |
| Google Play, app icon | `../assets/icon.png` (shrink to 512 × 512) | 512 × 512 |

The App Store takes its icon from the app itself (`npm run assets` makes every size from `assets/`).

## Forms the stores ask you to fill in

These answers describe what the game does today. Re-check them if ads, purchases or play statistics change.

**Age rating (both stores):** no violence, scary content, gambling, user chat, location sharing or
web browsing. Expect 4+ on the App Store and Everyone on Google Play. Say yes to "contains ads".

**In-app purchases:** none yet. (The Gardener's Pass and expansion world come later; the kit's
`Store` in `web/kit/js/monetization.js` is where they plug in.)

**Google Play Data safety and Apple App Privacy:** the game itself collects nothing (progress stays on
the device, and play statistics are off). The ads do: Google AdMob uses the device's advertising ID
and some app activity and diagnostics to show and measure ads. Fill both forms using Google's own
guides for AdMob ("Google Play's Data safety section" and "Prepare for Apple's App Store data
disclosure requirements" on the AdMob help site), which list exactly what the ad code collects.

**Google Play "App content":** Ads: yes. Target audience: see "Who it's for" above. Advertising ID:
yes, used for advertising (the AdMob plugin adds the permission).

**App Store export compliance:** the app uses no encryption beyond the system's own HTTPS.
`npm run app:setup` already marks this in the app, so the question is answered automatically.

## Accounts and one-time setup

- **Apple Developer Program:** a paid yearly membership (needed to publish, and to put test builds
  on your own iPhone through TestFlight). Publishing for iPhone needs a Mac with Xcode.
- **Google Play Console:** a one-time registration fee.
- **New personal Google Play accounts** must run a closed test with at least 12 testers who stay
  opted in for 14 days in a row before they can publish to everyone. Start recruiting testers
  (family, friends, school, other parents) early; aim for 15–20 so a few dropping out doesn't
  restart the clock. If Carrot Patch Defense already went through this on the same account, it
  doesn't need doing again.

## Building the release versions

1. `npm install`, then `npx cap add ios` and `npx cap add android`.
2. `npm run app:prepare` (fonts, icons, splash screens, portrait lock, version number, sync).
3. **Android:** make your private upload key once (Android Studio → Build → Generate Signed Bundle),
   keep it somewhere safe and backed up, then build an `.aab` and upload it to the closed testing
   track. Turn on Play App Signing when asked. Google Play requires new apps to target a recent
   Android version (Android 16, API level 36, for submissions from August 31, 2026); Capacitor's
   Android project sets this in `android/variables.gradle`.
4. **iPhone/iPad:** `npm run ios` opens Xcode. Choose your team under Signing & Capabilities,
   Product → Archive, then Distribute App → App Store Connect. Try it through TestFlight first.
5. Bump `version` in `package.json` for every new release; `npm run app:setup` copies it into both apps.

## Before you press Submit

- [ ] Played start to finish on a real iPhone and a real Android phone (the "Build phone apps"
      workflow posts an installable Android test app)
- [ ] Test mode is off on the test phones (tap the title 7 times if the "Test mode" badge shows)
- [ ] Real AdMob IDs in `config.js`, `testing: false`, and a rewarded ad watched once on a real phone
- [ ] Privacy and support pages load at their GitHub Pages addresses
- [ ] Screenshots remade with the real fonts (download them from the workflow run)
