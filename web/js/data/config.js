// App-wide settings that aren't game balance.
export const VERSION = '0.3.0';
// Anonymous play data (see kit/js/telemetry.js). Nothing is sent while `url` is empty.
export const TELEMETRY = { url:'', app:'rain_barrel' };
// Rewarded video ads in the phone apps (AdMob). These are Google's public TEST ids: they show real
// ads marked "Test Ad" and earn nothing. To go live, replace them with your own AdMob ids and set
// `testing` to false. Never tap your own live ads.
export const ADS = {
  testing: true,
  appId:    { android:'ca-app-pub-3940256099942544~3347511713', ios:'ca-app-pub-3940256099942544~1458002511' },
  rewarded: { android:'ca-app-pub-3940256099942544/5224354917', ios:'ca-app-pub-3940256099942544/1712485313' },
};
// One free hint per level; more hints come from an optional ad.
export const FREE_HINTS = 1;
// Hints start at this level (counting from 0, so 3 = Spring Meadow 4). The first levels are so small
// that one hint would solve them, so there's no Hint button there.
export const HINTS_FROM = 3;
// The hint jar: every level you finish with 3 stars for the first time adds a hint, up to this many.
export const JAR_MAX = 5;
