// Boot: build the page, load the save, wire sound and phone lifecycle, run the draw loop.
// Same shape as Carrot Patch's main.js.
import { MARKUP } from './ui/markup.js';
import { G } from './engine/game.js';
import { Save } from './save.js';
import { MUSIC } from './sounds.js';
import { on } from '../kit/js/events.js';
import { Audio } from '../kit/js/audio.js';
import { shake, confetti } from '../kit/js/fx.js';
import { bindSave, initAds } from '../kit/js/monetization.js';
import { initLifecycle } from '../kit/js/lifecycle.js';
import { haptic, setHaptics } from '../kit/js/haptics.js';
import { initTelemetry, track } from '../kit/js/telemetry.js';
import { initBoard, resize, draw } from './render/board.js';
import { initUI, showMenu, screen } from './ui/ui.js';
import { TELEMETRY, VERSION, ADS } from './data/config.js';

const board = () => document.getElementById('board');

// Engine events → sound, shake and touch feedback
on('turn', () => { Audio.play('turn'); haptic('light'); });
on('undo', () => Audio.play('turn'));
on('flow', () => Audio.play('flow'));
on('bloom', () => Audio.play('bloom'));
on('moo', () => Audio.play('moo'));
on('leak', () => Audio.play('leak'));
on('dry', () => { Audio.play('dry'); shake(board(), .6); haptic('medium'); });
on('uphill', () => Audio.play('uphill'));
on('place', () => { Audio.play('place'); haptic('light'); });
on('pickup', () => Audio.play('pickup'));
on('soaked', () => { Audio.play('soaked'); shake(board(), .5); });
on('hint', () => Audio.play('sparkle'));
on('levelStart', () => Audio.setMusic(MUSIC));
on('win', ({ stars }) => { haptic('success'); if (stars===3) setTimeout(() => confetti(), 750); });

// Anonymous play data (see kit/js/telemetry.js): counts only.
on('levelStart', LV => track('level_start', { gi:LV.gi }));
on('win', w => track('level_win', { gi:w.gi, stars:w.stars, taps:w.taps }));

function frame(now){
  if (screen==='play') draw(now);
  requestAnimationFrame(frame);
}

async function boot(){
  document.getElementById('root').innerHTML = MARKUP;
  await Save.load();
  bindSave(Save); initAds(ADS);
  Audio.init(Save.data.settings); Audio.setMusic(MUSIC);
  setHaptics(Save.data.settings.haptics!==false);
  initTelemetry({ ...TELEMETRY, version:VERSION, enabled:Save.data.settings.share!==false }); track('app_open');
  initBoard(document.getElementById('cv'), board());
  initUI();
  showMenu();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  initLifecycle({
    onPause(){ Audio.suspend(); Save.flush(); },
    onResume(){ Audio.resume(); },
    onBack(){ if (screen==='play') showMenu(); },
  });
  requestAnimationFrame(frame);
}
boot();
