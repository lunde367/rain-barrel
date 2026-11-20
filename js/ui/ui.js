// Everything the player sees and taps outside the board: home screen, HUD, controls and overlays.
// Built the same way as Carrot Patch's ui.js, on the shared kit.
import { $, starStr, ICON } from '../../kit/js/ui.js';
import { on } from '../../kit/js/events.js';
import { Audio } from '../../kit/js/audio.js';
import { Ads } from '../../kit/js/monetization.js';
import { devMode, secretTaps } from '../../kit/js/native.js';
import { createCoach } from '../../kit/js/coach.js';
import { setHaptics } from '../../kit/js/haptics.js';
import { Save, starsEarned } from '../save.js';
import { G, startLevel, turn, undo, applyHint, solveAll } from '../engine/game.js';
import { LEVELS, WORLDS, PARTS } from '../data/levels.js';
import { FREE_HINTS } from '../data/config.js';
import { resize, cellAt, flashTile, drawIcon } from '../render/board.js';
import { IC_HOME } from './markup.js';

export let screen = 'home';
const unlocked = gi => devMode || gi===0 || (Save.data.stars[gi-1]||0) > 0;
const worldOpen = wi => devMode || unlocked(LEVELS.find(l => l.wi===wi).gi);
const msg = t => { $('msg').textContent = t; };

const coach = createCoach({ onFinish(){ Save.data.tutorialDone = true; Save.commit(); } });

// ---------- home screen ----------
function home(html){
  screen = 'home'; coach.stop();
  $('app').classList.add('home-mode'); $('over').hidden = true;
  const h = $('home'); h.innerHTML = html; h.hidden = false; window.scrollTo(0,0);
  paintDev();
}
function nextLevel(){
  const i = LEVELS.findIndex(l => unlocked(l.gi) && !(Save.data.stars[l.gi]>0));
  return i < 0 ? null : LEVELS[i];
}
export function showMenu(){
  const worldHtml = (Wd, wi) => {
    if (!worldOpen(wi)){
      const prev = WORLDS[wi-1];
      return `<div class="chap locked" aria-disabled="true"><header><span class="chap-lock">${ICON.lock}</span>
        <span><b>${Wd.name}</b><small>Finish ${prev ? prev.name : 'the last garden'} to unlock</small></span></header></div>`;
    }
    const lvls = LEVELS.filter(l => l.wi===wi).map(l => { const ok=unlocked(l.gi), st=Save.data.stars[l.gi]||0;
      return `<button class="lv${G.LV&&G.LV.gi===l.gi?' cur':''}" data-lv="${l.gi}" ${ok?'':'disabled'}><b>${l.li+1}. ${l.name}</b>
        ${ok?`<span class="stars">${starStr(st)}</span>`:'<span class="lv-lock">Locked</span>'}</button>`; }).join('');
    return `<div class="chap"><header><canvas data-icon="${Wd.icon}" width="88" height="88"></canvas>
      <span><b>${Wd.name}</b><small>${Wd.blurb}</small></span></header><div class="lvls">${lvls}</div></div>`;
  };
  const parts = PARTS.map(P => {
    const ws = WORLDS.map((w,i) => [w,i]).filter(([w]) => w.part===P.n);
    const lv = LEVELS.filter(l => WORLDS[l.wi].part===P.n), got = lv.reduce((a,l) => a+(Save.data.stars[l.gi]||0), 0);
    const open = Save.data.fold[P.n] !== false;
    return `<section class="part${open?' open':''}" style="--part:${P.tint}">
      <button class="part-head" data-go="fold" data-part="${P.n}" aria-expanded="${open}"><span class="part-n">Part ${P.n}</span>
        <b>${P.name}</b><span class="part-meta">★ ${got}/${lv.length*3}</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="part-body">${ws.map(([w,i]) => worldHtml(w,i)).join('')}</div></section>`;
  }).join('');
  const nx = nextLevel();
  home(`<div class="home-head"><h2>Your gardens</h2>
      <button class="btn ghost icon" data-go="settings" aria-label="Settings">${ICON.gear}</button></div>
    ${nx ? `<button class="btn main continue" data-lv="${nx.gi}">${starsEarned()>0?'Continue':'Start'} · ${nx.W.name} ${nx.li+1}: ${nx.name}</button>`
         : `<p class="home-note">Every garden is watered. Replay any level to earn more stars.</p>`}
    ${parts}
    ${devMode?'<p class="devnote">Test mode is on: every level is unlocked, and each level has a Solve button. Tap the title 7 times to turn it off.</p>':''}`);
  for (const c of $('home').querySelectorAll('canvas[data-icon]')) drawIcon(c, c.dataset.icon);
}
function showSettings(){
  const s = Save.data.settings;
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back">${ICON.back}</button><h2>Settings</h2></div>
    <div class="set-list">
      <div class="set-row"><span><b>Sound effects</b></span><button class="btn ghost small" data-go="set" data-k="sfx">${s.sfx?'On':'Off'}</button></div>
      <div class="set-row"><span><b>Music</b></span><button class="btn ghost small" data-go="set" data-k="music">${s.music?'On':'Off'}</button></div>
      <div class="set-row"><span><b>Vibration</b></span><button class="btn ghost small" data-go="set" data-k="haptics">${s.haptics!==false?'On':'Off'}</button></div>
      <div class="set-row"><span><b>Erase progress</b><small>Clears every star. Tap twice to confirm.</small></span><button class="btn ghost small" data-go="erase" id="eraseBtn">Erase</button></div>
    </div>
    <p class="devnote">Rain Barrel · prototype</p>`);
}

// ---------- playing a level ----------
export function play(gi){
  if (!unlocked(gi)) return;
  screen = 'play'; coach.stop();
  $('home').hidden = true; $('over').hidden = true; $('app').classList.remove('home-mode');
  startLevel(gi);
  const LV = G.LV;
  msg(`${LV.W.name} ${LV.li+1}: ${LV.name}. ${LV.note}`);
  paintHud(); paintDev();
  requestAnimationFrame(resize);
  if (gi===0 && !Save.data.tutorialDone) setTimeout(() => coach.start([
    { text:'Tap a channel to turn it. Water flows when the channels line up.', target:'#board', place:'over-bottom', until:'turn' },
    { text:'Get water from the rain barrel to the sprout. Use Undo if you make a mistake.', target:'#board', place:'over-bottom', until:'win' },
  ]), 400);
}

function paintHud(){
  const S = G.S; if (!S) return;
  const f = S.flow, capped = S.cap !== Infinity;
  $('water').textContent = capped ? `${f.left}` : `${f.water}/${S.budget}`;
  $('waterLbl').textContent = capped ? `of ${S.cap} left` : 'water';
  $('waterChip').classList.toggle('warn', capped ? f.ranOut : f.water > S.budget);
  $('taps').textContent = S.taps; $('tapsLbl').textContent = `par ${S.par}`;
  $('tapsChip').classList.toggle('warn', S.taps > S.par);
  $('plants').textContent = `${f.watered.size}/${S.plants}`;
  $('undo').disabled = !S.history.length || S.done;
  const free = S.hints < FREE_HINTS;
  $('hint').innerHTML = free ? 'Free hint' : 'Hint <small class="ad-tag">ad</small>';
  $('hint').disabled = S.done;
}
export function paintDev(){
  $('devBadge').hidden = !devMode;
  $('devSkip').hidden = !devMode || screen!=='play' || !G.S || G.S.done;
}
function soundState(){ const s=Save.data.settings; return s.sfx && s.music ? 'all' : s.sfx ? 'fx' : 'off'; }
function paintSound(){
  const st = soundState(), b = $('sound');
  b.innerHTML = st==='all' ? ICON.soundAll : st==='fx' ? ICON.soundFx : ICON.soundOff;
  b.setAttribute('aria-label', st==='all' ? 'Sound: music and effects' : st==='fx' ? 'Sound: effects only' : 'Sound: off');
}
function onSound(){
  const s = Save.data.settings, st = soundState();
  if (st==='all'){ s.music=false; s.sfx=true; } else if (st==='fx'){ s.sfx=false; s.music=false; } else { s.sfx=true; s.music=true; }
  Save.commit(); Audio.setSettings(s); paintSound(); Audio.play('tap');
}

async function onHint(){
  const S = G.S; if (!S || S.done) return;
  if (S.hints >= FREE_HINTS){
    const ok = await Ads.showRewarded('hint', 'One hint');
    if (!ok || G.S !== S || S.done) return;
  }
  const i = applyHint();
  if (i < 0){ msg('The main route is already right. Look for stray pipes that leak or water the wrong way.'); return; }
  Save.data.stats.hints++; Save.commit();
  flashTile(i); msg('Hint: the glowing channel is now turned the right way.');
}

// ---------- results ----------
const resultIcons = () => `<div class="res-icons">
  <button class="btn ghost round" data-go="menu" aria-label="All gardens" title="All gardens">${IC_HOME}</button>
  <button class="btn ghost round" data-go="retry" aria-label="Play again" title="Play again">${ICON.restart}</button></div>`;
function overlay(html){ const o=$('over'); o.innerHTML=html; o.hidden=false; o.scrollTop=0; }
function showWin(w){
  const S = G.S, LV = G.LV, next = LEVELS[LV.gi+1];
  const tips = [];
  if (w.water > w.budget) tips.push(w.leaks ? 'Fix the leaks and use a shorter route to save water.' : 'A shorter or cooler route would save water.');
  if (w.taps > w.par) tips.push(`Solve it in ${w.par} taps or fewer for the last star.`);
  overlay(`<div class="panel result"><h3>${LV.name}: watered!</h3><div class="stars">${starStr(w.stars)}</div>
      <div class="res-chips"><span class="blue">${w.capped ? `${S.cap - w.water} of ${S.cap} drops left` : `${w.water} of ${w.budget} drops`}</span><span class="plain">${w.taps} taps · par ${w.par}</span></div>
      <p>${tips.length ? tips.join(' ') : 'Perfect! Mother Nature thanks you.'}</p></div>
    <div class="res-actions">${next ? `<button class="btn main" data-go="next">${next.wi!==LV.wi ? `On to ${next.W.name}` : 'Next level'}</button>`
      : `<button class="btn main" data-go="menu">Back to the gardens</button>`}${resultIcons()}</div>`);
}

// ---------- wiring ----------
let eraseArmed = false;
export function initUI(){
  $('board').addEventListener('pointerdown', e => {
    if (screen!=='play' || !$('over').hidden || e.target.closest('button')) return;
    const i = cellAt(e.clientX, e.clientY); if (i >= 0) turn(i);
  });
  $('hint').onclick = onHint;
  $('undo').onclick = () => undo();
  $('restart').onclick = () => { if (G.LV){ Audio.play('tap'); play(G.LV.gi); } };
  $('sound').onclick = onSound;
  $('map').onclick = () => { Audio.play('tap'); showMenu(); };
  $('devSkip').onclick = () => { if (devMode) solveAll(); };
  document.addEventListener('click', e => {
    const lv = e.target.closest('[data-lv]');
    if (lv && !lv.disabled){ Audio.play('tap'); play(+lv.dataset.lv); return; }
    const b = e.target.closest('[data-go]'); if (!b) return;
    const go = b.dataset.go;
    if (go==='menu') showMenu();
    else if (go==='settings') showSettings();
    else if (go==='retry') play(G.LV.gi);
    else if (go==='next') play(G.LV.gi+1);
    else if (go==='fold'){ const n=+b.dataset.part, part=b.closest('.part'); const open=!part.classList.contains('open'); part.classList.toggle('open', open); b.setAttribute('aria-expanded', open); Save.data.fold[n]=open; Save.commit(); }
    else if (go==='set'){ const s=Save.data.settings, k=b.dataset.k; s[k] = k==='haptics' ? s[k]===false : !s[k]; Save.commit(); Audio.setSettings(s); setHaptics(s.haptics!==false); paintSound(); showSettings(); }
    else if (go==='erase'){
      if (!eraseArmed){ eraseArmed=true; b.textContent='Tap again to erase'; b.classList.add('armed'); setTimeout(()=>{ eraseArmed=false; if (b.isConnected){ b.textContent='Erase'; b.classList.remove('armed'); } }, 3000); return; }
      eraseArmed=false; Save.reset(['settings','owned']); showMenu();
    }
    if (go!=='fold') Audio.play('tap');
  });
  // Secret switch, same as Carrot Patch: tap the title 7 times quickly to turn test mode on or off.
  secretTaps(document.querySelector('.k-title'), on => {
    Audio.play(on ? 'sparkle' : 'tap'); paintDev();
    if (screen==='play') msg(on ? 'Test mode on. Tap Solve to finish a level.' : 'Test mode off.');
    else showMenu();
  });
  paintSound();

  on('changed', () => { paintHud(); paintDev(); });
  on('locked', () => { Audio.play('denied'); msg('That piece has a stone rim: it is stuck in place.'); });
  on('dry', () => msg('The barrel ran dry before the water got there!'));
  on('uphill', () => msg('A red ▲ means water can’t flow uphill there.'));
  on('moo', () => { if (G.S.cap!==Infinity) msg('A cow took a drink: 2 drops gone.'); });
  on('win', w => {
    if ((Save.data.stars[w.gi]||0) < w.stars){ Save.data.stars[w.gi] = w.stars; }
    Save.data.stats.wins++; Save.commit();
    setTimeout(() => { if (G.LV && G.LV.gi===w.gi && screen==='play') { showWin(w); Audio.play('win'); } }, 700);
  });
}
