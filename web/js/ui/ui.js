// Everything the player sees and taps outside the board: home screen, HUD, controls and overlays.
// Built the same way as Carrot Patch's ui.js, on the shared kit.
import { $, starStr, ICON } from '../../kit/js/ui.js';
import { on } from '../../kit/js/events.js';
import { Audio } from '../../kit/js/audio.js';
import { Ads } from '../../kit/js/monetization.js';
import { toast } from '../../kit/js/fx.js';
import { devMode, secretTaps } from '../../kit/js/native.js';
import { createCoach } from '../../kit/js/coach.js';
import { setHaptics } from '../../kit/js/haptics.js';
import { shouldAskRating, answerRating } from '../../kit/js/rating.js';
import { Save, starsEarned } from '../save.js';
import { G, startLevel, turn, undo, applyHint, solveAll, place, pickUp } from '../engine/game.js';
import { LEVELS, WORLDS, PARTS, SOURCES } from '../data/levels.js';
import { FREE_HINTS, HINTS_FROM, JAR_MAX, VERSION } from '../data/config.js';
import { resize, cellAt, flashTile, drawIcon, drawPiece, setSelected } from '../render/board.js';
import { IC_HOME } from './markup.js';

export let screen = 'home';
// Unlocking: a world opens once you have enough stars from the world before it.
// Inside an open world every level is playable in any order; only the tutorial (Spring Meadow 1) must come first.
// The Puzzle Shed sits outside that chain: each bonus level opens at a total number of stars from the main worlds.
const worldStars = wi => LEVELS.filter(l => l.wi===wi).reduce((a,l) => a+(Save.data.stars[l.id]||0), 0);
const mainStars = () => LEVELS.filter(l => !l.lab && !l.shed).reduce((a,l) => a+(Save.data.stars[l.id]||0), 0);
const peek = {};   // locked parts the player has unfolded to look at (not saved)
const worldOpen = wi => devMode || WORLDS[wi].shed || (!WORLDS[wi].lab && (wi===0 || (worldOpen(wi-1) && worldStars(wi-1) >= WORLDS[wi].need)));
const tutorialDone = () => (Save.data.stars[LEVELS[0].id]||0) > 0;
const unlocked = gi => { if (devMode) return true; const L=LEVELS[gi];
  if (L.shed) return mainStars() >= L.needTotal;
  if (!worldOpen(L.wi)) return false; return !(L.wi===0 && L.li>0 && !tutorialDone()); };
// The next world that's still closed, and how many more stars it needs.
function nextGoal(){
  const wi = WORLDS.findIndex((w,i) => !w.lab && !w.shed && !worldOpen(i)); if (wi < 0) return null;
  return { wi, W:WORLDS[wi], prev:WORLDS[wi-1], left:WORLDS[wi].need - worldStars(wi-1) };
}
const msg = t => { $('msg').textContent = t; };

const coach = createCoach({ onFinish(){ Save.data.tutorialDone = true; Save.commit(); } });

// ---------- home screen ----------
function home(html){
  screen = 'home'; coach.stop();
  $('app').classList.add('home-mode'); closeOverlay();
  const h = $('home'); h.innerHTML = html; h.hidden = false; window.scrollTo(0,0);
  paintDev();
}
function nextLevel(){
  const i = LEVELS.findIndex(l => !l.lab && !l.shed && unlocked(l.gi) && !((Save.data.stars[l.id]||0)>0));
  return i < 0 ? null : LEVELS[i];
}
export function showMenu(){
  const worldHtml = (Wd, wi) => {
    if (!worldOpen(wi)){
      const prev = WORLDS[wi-1];
      const have = Math.min(Wd.need, worldStars(wi-1)), reach = worldOpen(wi-1);
      return `<div class="chap locked" aria-disabled="true"><header><span class="chap-lock">${ICON.lock}</span>
        <span><b>${Wd.name}</b><small>${reach ? `Collect ${Wd.need} ★ in ${prev.name} to open` : `Open ${prev.name} first`}</small></span></header>
        ${reach ? `<div class="need"><div class="need-bar"><i style="width:${Math.round(have/Wd.need*100)}%"></i></div><span>★ ${have}/${Wd.need}</span></div>` : ''}</div>`;
    }
    const lvls = LEVELS.filter(l => l.wi===wi).map(l => { const ok=unlocked(l.gi), st=Save.data.stars[l.id]||0;
      return `<button class="lv${G.LV&&G.LV.gi===l.gi?' cur':''}" data-lv="${l.gi}" ${ok?'':'disabled'}><b>${l.li+1}. ${l.name}</b>
        ${ok?`<span class="stars">${starStr(st)}</span>`:`<span class="lv-lock">${l.shed?`Opens at ${l.needTotal} ★`:l.wi===0?'Play 1 first':'Locked'}</span>`}</button>`; }).join('');
    const blurb = Wd.shed ? `${Wd.blurb}. You have ${mainStars()} ★.` : Wd.blurb;
    return `<div class="chap"><header><canvas data-icon="${Wd.icon}" width="88" height="88"></canvas>
      <span><b>${Wd.name}</b><small>${blurb}</small></span></header><div class="lvls">${lvls}</div></div>`;
  };
  const parts = PARTS.filter(P => (!P.lab || devMode) && WORLDS.some(w => w.part===P.n)).map(P => {
    const ws = WORLDS.map((w,i) => [w,i]).filter(([w]) => w.part===P.n);
    const lv = LEVELS.filter(l => WORLDS[l.wi].part===P.n), got = lv.reduce((a,l) => a+(Save.data.stars[l.id]||0), 0);
    // A part with nothing playable yet starts folded, with a lock. Tapping it still peeks inside
    // (just for now: the fold is only saved for parts you can play).
    const later = !devMode && ws.every(([w,i]) => w.shed ? lv.every(l => starsEarned() < l.needTotal) : !worldOpen(i));
    const open = later ? !!peek[P.n] : Save.data.fold[P.n] !== false;
    return `<section class="part${open?' open':''}${later?' later':''}" style="--part:${P.tint}">
      <button class="part-head" data-go="fold" data-part="${P.n}" data-later="${later?1:''}" aria-expanded="${open}"><span class="part-n">${P.label || `Part ${P.n}`}</span>
        <b>${P.name}</b><span class="part-meta">${later ? `${ICON.lock} Locked` : `★ ${got}/${lv.length*3}`}</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="part-body">${ws.map(([w,i]) => worldHtml(w,i)).join('')}</div></section>`;
  }).join('');
  const nx = nextLevel(), goal = nextGoal();
  home(`<div class="home-head"><h2>Your gardens</h2>
      <button class="btn ghost icon" data-go="settings" aria-label="Settings">${ICON.gear}</button></div>
    ${nx ? `<button class="btn main continue" data-lv="${nx.gi}">${starsEarned()>0?'Continue':'Start'} · ${nx.W.name} ${nx.li+1}: ${nx.name}</button>`
         : goal ? `<p class="home-note">Collect ${goal.left} more ★ in ${goal.prev.name} to open ${goal.W.name}. Replay levels to earn 3 stars.</p>`
         : `<p class="home-note">Every garden is open. Replay any level to earn more stars.</p>`}
    <p class="home-note jar-note">💡 Hint jar: ${Save.data.jar||0} of ${JAR_MAX}. Every new 3-star level adds a hint.</p>
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
      <div class="set-row"><span><b>Reduce motion</b><small>No screen shake or confetti</small></span><button class="btn ghost small" data-go="set" data-k="calm">${s.calm?'On':'Off'}</button></div>
      <div class="set-row"><span><b>Erase progress</b><small>Clears every star. Tap twice to confirm.</small></span><button class="btn ghost small" data-go="erase" id="eraseBtn">Erase</button></div>
    </div>
    <p class="devnote"><a href="support.html">Help</a> · <a href="privacy.html">Privacy</a> · Rain Barrel ${VERSION}</p>`);
}

// ---------- playing a level ----------
export function play(gi){
  if (!unlocked(gi)) return;
  screen = 'play'; coach.stop();
  $('home').hidden = true; closeOverlay(); $('app').classList.remove('home-mode');
  startLevel(gi);
  const LV = G.LV;
  const src = LV.src && LV.src!=='barrel' ? ` Water comes from the ${SOURCES[LV.src].name}.` : '';
  msg(`${LV.W.name} ${LV.li+1}: ${LV.name}.${src} ${LV.note}`);
  paintHud(); paintDev();
  requestAnimationFrame(resize);
  selectTray(null);
  const has = kind => G.S.tiles.some(t => kind==='cactus' ? t.type==='cactus' : kind==='tray' ? t.slot : t.link);
  const TIPS = {
    cactus:['🌵','Keep the cactus dry','Cacti hate water. If any channel pours onto one, the level isn’t solved.'],
    tray:['🧺','Pieces in the tray','Tap a piece in the tray, then tap an empty dirt patch to place it. Tap a placed piece to turn it; press and hold to put it back.'],
    linked:['🌸','Linked pieces','Pieces with the same colored flower turn together. Fixing one can turn another the wrong way!'],
  };
  for (const k of Object.keys(TIPS)) if (has(k) && !Save.data.seen[k+'Tip']){
    Save.data.seen[k+'Tip'] = true; Save.commit();
    const [ic, title, text] = TIPS[k];
    setTimeout(() => toast(`<span class="t-icon">${ic}</span><span><b>${title}</b><small>${text}</small></span>`, { ms:8000 }), 500);
    break;
  }
  if (gi >= HINTS_FROM && !G.LV.lab && !Save.data.seen.hintTip){
    Save.data.seen.hintTip = true; Save.commit();
    setTimeout(() => toast('<span class="t-icon">💡</span><span><b>Hints are here</b><small>Stuck? The Hint button turns one channel the right way. Your first hint in each level is free.</small></span>', { ms:6500 }), 600);
  }
  if (gi===0 && !Save.data.tutorialDone) setTimeout(() => coach.start([
    // No target: the bubble sits at the bottom of the screen, so it never covers the pieces (small phones too).
    { text:'Tap a channel to turn it. Water flows when the channels line up.', until:'turn' },
    { text:'Get water from the rain barrel to the sprout. Use Undo if you make a mistake.', until:'win' },
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
  const hintsHere = G.LV.gi >= HINTS_FROM;
  $('hint').hidden = !hintsHere; $('undo').classList.toggle('grow', !hintsHere);
  const free = S.hints < FREE_HINTS;
  const jar = Save.data.jar || 0;
  $('hint').innerHTML = free ? 'Hint <small class="ad-tag">free</small>' : jar > 0 ? `Hint <small class="ad-tag">jar ${jar}</small>` : 'Hint <small class="ad-tag">ad</small>';
  paintTray();
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
  let fromJar = false;
  if (S.hints >= FREE_HINTS){
    if ((Save.data.jar||0) > 0) fromJar = true;   // hints earned with 3-star finishes come first, no ad
    else { const ok = await Ads.showRewarded('hint', 'One hint'); if (!ok || G.S !== S || S.done) return; }
  }
  const i = applyHint();
  if (i < 0){ msg('The main route is already right. Look for stray pipes that leak or water the wrong way.'); return; }
  if (fromJar) Save.data.jar--;
  Save.data.stats.hints++; Save.commit(); paintHud();
  flashTile(i); msg('Hint: the glowing channel is now turned the right way.');
}

// ---------- the tray ----------
let selTray = null;
function selectTray(k){ selTray = k; setSelected(k); paintTray(); }
function paintTray(){
  const S = G.S, el = $('tray');
  if (screen!=='play' || !S || !S.tray || !S.tray.length){ el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = '<span class="tray-lbl">Tray</span>' + S.tray.map((p,k) =>
    `<button class="tray-item${p.used?' used':''}${selTray===k?' sel':''}" data-tray="${k}" ${p.used?'disabled':''} aria-label="Tray piece"><canvas width="88" height="88"></canvas></button>`).join('');
  el.querySelectorAll('canvas').forEach((c, k) => drawPiece(c, S.tray[k].base, S.tray[k].rot));
}

// ---------- results ----------
const resultIcons = () => `<div class="res-icons">
  <button class="btn ghost round" data-go="menu" aria-label="All gardens" title="All gardens">${IC_HOME}</button>
  <button class="btn ghost round" data-go="retry" aria-label="Play again" title="Play again">${ICON.restart}</button></div>`;
// The results card covers the whole screen, so nothing else (Hint, Undo...) can be tapped behind it.
function overlay(html){ const o=$('over'); o.innerHTML=html; o.hidden=false; o.scrollTop=0; }
function closeOverlay(){ $('over').hidden = true; }
function showWin(w){
  const S = G.S, LV = G.LV, after = LEVELS[LV.gi+1], next = after && unlocked(after.gi) ? after : null, goal = nextGoal();
  const chips = (w.opened||[]).map(i => `<span>${WORLDS[i].name} is open!</span>`).join('')
    + (!next && goal && goal.wi===LV.wi+1 ? `<span class="plain">${goal.left} more ★ to open ${goal.W.name}</span>` : '');
  const tips = [];
  if (w.water > w.budget) tips.push(w.leaks ? 'Fix the leaks and use a shorter route to save water.' : 'A shorter or cooler route would save water.');
  if (w.taps > w.par) tips.push(`Solve it in ${w.par} taps or fewer for the last star.`);
  overlay(`<div class="panel result"><h3>${LV.name}: watered!</h3><div class="stars">${starStr(w.stars)}</div>
      <div class="res-chips"><span class="blue">${w.capped ? `${S.cap - w.water} of ${S.cap} drops left` : `${w.water} of ${w.budget} drops`}</span><span class="plain">${w.taps} tap${w.taps===1?"":"s"} · par ${w.par}</span></div>
      ${chips ? `<div class="res-chips">${chips}</div>` : ''}
      <p>${tips.length ? tips.join(' ') : 'Perfect! Mother Nature thanks you.'}</p>
      ${w.stars===3 && shouldAskRating(Save, { wins:Save.data.stats.wins }) ? `<div class="rate-box" id="rateBox"><b>Enjoying Rain Barrel?</b><span>A rating helps other families find it.</span><div class="row"><button class="btn main small" data-go="rate" data-a="ok">OK</button>
        <button class="btn ghost small" data-go="rate" data-a="later">Not now</button><button class="btn ghost small" data-go="rate" data-a="never">Never ask me again</button></div></div>` : ''}</div>
    <div class="res-actions">${next ? `<button class="btn main" data-go="next">${next.wi!==LV.wi ? `On to ${next.W.name}` : 'Next level'}</button>`
      : `<button class="btn main" data-go="menu">Back to the gardens</button>`}${resultIcons()}</div>`);
}

// ---------- wiring ----------
let eraseArmed = false, playerTurned = false;
export function initUI(){
  // Tap: turn a piece, or place the selected tray piece on an empty slot.
  // Press and hold a placed piece to put it back in the tray.
  let press = null;
  $('board').addEventListener('pointerdown', e => {
    if (screen!=='play' || !$('over').hidden || e.target.closest('button')) return;
    const i = cellAt(e.clientX, e.clientY); if (i < 0) return;
    const T = G.S.tiles[i];
    if (T.type==='slot'){
      if (selTray!=null){ const k = selTray; selectTray(null); place(k, i); }
      else msg('Pick a piece from the tray first, then tap an empty dirt patch.');
      return;
    }
    if (T.type==='pipe' && T.from!=null){ press = { i, timer:setTimeout(() => { press = null; pickUp(i); }, 450) }; return; }
    turn(i);
  });
  const release = turnIt => { if (!press) return; clearTimeout(press.timer); const i = press.i; press = null; if (turnIt) turn(i); };
  $('board').addEventListener('pointerup', () => release(true));
  $('board').addEventListener('pointerleave', () => release(false));
  $('board').addEventListener('pointercancel', () => release(false));
  $('tray').addEventListener('click', e => { const b = e.target.closest('[data-tray]'); if (!b || b.disabled) return;
    const k = +b.dataset.tray; selectTray(selTray===k ? null : k); Audio.play('tap'); });
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
    else if (go==='fold'){ const n=+b.dataset.part, part=b.closest('.part'); const open=!part.classList.contains('open'); part.classList.toggle('open', open); b.setAttribute('aria-expanded', open); if (b.dataset.later) peek[n]=open; else { Save.data.fold[n]=open; Save.commit(); } }
    else if (go==='set'){ const s=Save.data.settings, k=b.dataset.k; s[k] = k==='haptics' ? s[k]===false : !s[k]; Save.commit(); Audio.setSettings(s); setHaptics(s.haptics!==false);
      document.documentElement.classList.toggle('reduce-motion', !!s.calm); paintSound(); showSettings(); }
    else if (go==='rate'){ const a=b.dataset.a; answerRating(Save, a); const box=$('rateBox'); if (box) box.innerHTML = a==='ok' ? '<b>Thank you!</b>' : '<span>No problem.</span>'; return; }
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

  on('changed', () => { paintHud(); paintDev(); playerTurned = false; });
  // One-time tip, only when the player's own move opens a new leak (not leaks the level starts with).
  on('turn', () => { playerTurned = true; });
  on('leak', () => {
    if (!playerTurned || Save.data.seen.leakTip) return;
    Save.data.seen.leakTip = true; Save.commit();
    toast('<span class="t-icon">💧</span><span><b>Leak!</b><small>Water is spilling out where the channels don’t line up. Each leak wastes 2 drops. Turn the pieces so the openings meet.</small></span>', { ms:7000 });
  });
  on('soaked', () => msg('Oh no, the cactus got wet! Cacti need to stay dry.'));
  on('locked', () => { Audio.play('denied'); msg('That piece has a stone rim: it is stuck in place.'); });
  on('dry', () => msg('The barrel ran dry before the water got there!'));
  on('uphill', () => msg('A red ▲ means water can’t flow uphill there.'));
  on('moo', () => { if (G.S.cap!==Infinity) msg('A cow took a drink: 2 drops gone.'); });
  on('win', w => {
    const before = WORLDS.map((_,i) => worldOpen(i));
    const L = LEVELS[w.gi];
    if (!L.lab && w.stars===3 && (Save.data.stars[LEVELS[w.gi].id]||0) < 3 && (Save.data.jar||0) < JAR_MAX){
      Save.data.jar = (Save.data.jar||0) + 1;
      setTimeout(() => toast(`<span class="t-icon">💡</span><span><b>+1 hint in your jar</b><small>You have ${Save.data.jar} saved. They’re used before any ad.</small></span>`), 1400);
    }
    if ((Save.data.stars[LEVELS[w.gi].id]||0) < w.stars){ Save.data.stars[LEVELS[w.gi].id] = w.stars; }
    w.opened = WORLDS.map((_,i) => i).filter(i => !before[i] && worldOpen(i));
    if (w.opened.length) setTimeout(() => toast(`<span class="t-icon">★</span><span><b>${WORLDS[w.opened[0]].name} is open!</b><small>New puzzles are waiting on the home screen.</small></span>`), 900);
    Save.data.stats.wins++; Save.commit();
    setTimeout(() => { if (G.LV && G.LV.gi===w.gi && screen==='play') { showWin(w); Audio.play('win'); } }, 700);
  });
}
