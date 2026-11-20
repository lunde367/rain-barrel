// Rain Barrel's save data, built on the kit's save system (same as Carrot Patch).
import { createSave } from '../kit/js/storage.js';

const defaults = () => ({
  v: 1,
  stars: [],                                   // best stars per level, by level index
  tutorialDone: false,
  settings: { sfx:true, music:true, haptics:true },
  owned: {},                                   // purchases, e.g. { remove_ads:true }
  stats: { wins:0, hints:0 },
  fold: {},                                    // home screen: parts the player closed
  seen: {},                                    // one-time tips already shown, e.g. { leakTip:true }
});

function migrate(d, base){
  return { ...base, ...d, v:base.v,
    stars: Array.isArray(d.stars) ? d.stars : [],
    settings: { ...base.settings, ...(d.settings||{}) },
    owned: { ...(d.owned||{}) }, stats: { ...base.stats, ...(d.stats||{}) }, fold: { ...(d.fold||{}) }, seen: { ...(d.seen||{}) } };
}

export const Save = createSave({
  key: 'rain-barrel-save', defaults, migrate,
  // The first prototype kept stars under its own key: carry them over.
  legacy: () => { const old = JSON.parse(localStorage.getItem('rainbarrel.stars')); return Array.isArray(old) ? { stars:old } : null; },
});

export const starsEarned = () => Save.data.stars.reduce((a,b) => a+(b||0), 0);
