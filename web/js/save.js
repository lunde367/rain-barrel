// Rain Barrel's save data, built on the kit's save system (same as Carrot Patch).
import { createSave } from '../kit/js/storage.js';
import { levelId } from './data/ids.js';

const defaults = () => ({
  v: 2,
  stars: {},                                   // best stars per level, by level id (see levels.js)
  tutorialDone: false,
  settings: { sfx:true, music:true, haptics:true, calm:false },   // calm = reduce motion
  owned: {},                                   // purchases, e.g. { remove_ads:true }
  stats: { wins:0, hints:0 },
  fold: {},                                    // home screen: parts the player closed
  jar: 0,                                      // hints saved up from 3-star finishes
  rating: {},                                  // the 'enjoying the game?' question: asks, last, never, done
  seen: {},                                    // one-time tips already shown, e.g. { leakTip:true }
});

// Saves before v2 kept stars in a list, in the order of the first 16 hand-made levels.
// Those levels keep their names (and so their ids), so their stars carry over; the rest are gone.
const OLD_ORDER = ['First Sip','Around the Bend','Rock Garden','Two Sprouts','Locked Gate','Stray Pipes','Twin Barrels',
  'Long Way Round','Hot Afternoon','Dry Spell','Moo-ving Water','Last Drops','Pasture Problem','Downhill','Windmill','High Pasture'];
function oldStars(list){ const out = {}; list.forEach((n, i) => { if (n && OLD_ORDER[i]) out[levelId(OLD_ORDER[i])] = n; }); return out; }
function migrate(d, base){
  return { ...base, ...d, v:base.v,
    stars: Array.isArray(d.stars) ? oldStars(d.stars) : (d.stars && typeof d.stars==='object' ? { ...d.stars } : {}),
    settings: { ...base.settings, ...(d.settings||{}) },
    owned: { ...(d.owned||{}) }, stats: { ...base.stats, ...(d.stats||{}) }, fold: { ...(d.fold||{}) }, seen: { ...(d.seen||{}) }, rating: { ...(d.rating||{}) } };
}

export const Save = createSave({
  key: 'rain-barrel-save', defaults, migrate,
  // The first prototype kept stars under its own key: carry them over.
  legacy: () => { const old = JSON.parse(localStorage.getItem('rainbarrel.stars')); return Array.isArray(old) ? { stars:old } : null; },
});

export const starsEarned = () => Object.values(Save.data.stars).reduce((a,b) => a+(b||0), 0);
