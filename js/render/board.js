// The garden board, drawn on a canvas in the family art style (soft round shapes, darker outlines,
// small white highlights), with the same grass and dirt colors as Carrot Patch.
import { G } from '../engine/game.js';
import { ell, rng } from '../../kit/js/draw.js';
import { DIRS, rotMask } from '../engine/flow.js';

let cv, g, boardEl, tile = 60, W = 0, H = 0, dpr = 1;
const flashes = {};                 // tile index → time the hint glow ends

export function initBoard(canvas, el){
  cv = canvas; boardEl = el; g = cv.getContext('2d');
  const onResize = () => requestAnimationFrame(resize);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
}

// Fit the board to the space left after the HUD, controls and message row (same approach as Carrot Patch).
export function resize(){
  const S = G.S; if (!S || boardEl.offsetParent===null) return;
  const app = boardEl.parentElement;
  const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  const kids = [...app.children].filter(el => el!==boardEl && el.offsetParent!==null);
  const gap = parseFloat(getComputedStyle(app).rowGap) || 0;
  const pad = el => { const cs=getComputedStyle(el); return parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom); };
  const reserved = kids.reduce((h,el) => h+el.offsetHeight, 0) + gap*kids.length + pad(document.body) + pad(document.documentElement) + 6;
  const fitW = Math.min(app.clientWidth, 560) / S.W, fitH = (vh - reserved) / S.H;
  tile = Math.max(34, Math.min(92, Math.floor(Math.min(fitW, fitH))));
  W = tile*S.W; H = tile*S.H; dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
  cv.style.width = W+'px'; cv.style.height = H+'px';
}

export function cellAt(clientX, clientY){
  const S = G.S, rc = cv.getBoundingClientRect();
  const c = Math.floor((clientX-rc.left)/tile), r = Math.floor((clientY-rc.top)/tile);
  return (S && r>=0 && c>=0 && r<S.H && c<S.W) ? r*S.W + c : -1;
}
export function flashTile(i){ flashes[i] = performance.now() + 1500; }
export const tileRect = i => { const S=G.S, rc=cv.getBoundingClientRect(); return { x:rc.left+(i%S.W)*tile, y:rc.top+Math.floor(i/S.W)*tile, s:tile }; };

// ---------- ground colors ----------
const HEIGHT_GRASS = [['#93c179','#8bb971'], ['#c4dc88','#bad37e'], ['#e7d59e','#ddcb93']];
const SAND = ['#efd8a0','#e8cf95'];
function groundColor(S, T){
  const k = (T.r+T.c)%2;
  if (T.hot) return SAND[k];
  if (S.hilly) return HEIGHT_GRASS[T.h][k];
  return G.LV.W.grass[k];
}

// ---------- the whole board, every frame ----------
export function draw(now){
  const S = G.S; if (!S || !W) return;
  const t = now/1000, s = tile, f = S.flow;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  S.hilly = S.hilly ?? S.tiles.some(T => T.h>0);

  for (const T of S.tiles){
    const x=T.c*s, y=T.r*s;
    g.fillStyle = groundColor(S, T); g.fillRect(x, y, s, s);
    if (T.hot) cracks(x, y, s, T.i);
    else if (T.type==='grass') tufts(x, y, s, T.i);
  }
  if (S.hilly) cliffs(S, s);

  for (const T of S.tiles){
    const x=T.c*s, y=T.r*s, cx=x+s/2, cy=y+s/2;
    if (T.type==='pipe'){
      const target = T.rot*90; if (T.vis==null) T.vis = target;
      T.vis += (target - T.vis) * .35; if (Math.abs(target - T.vis) < .5) T.vis = target;
      if (T.locked) lockedRim(x, y, s);
      pipe(T, cx, cy, s, f.wet.has(T.i), t);
      if (f.wet.has(T.i)) ripples(T, cx, cy, s, f.entry[T.i], t);
      if (T.pump) windmill(x+s*.8, y+s*.2, s, f.wet.has(T.i), t);
    }
    else if (T.type==='src') barrel(g, cx, cy, s);
    else if (T.type==='plant'){ T.bloom = (T.bloom||0) + ((f.watered.has(T.i)?1:0) - (T.bloom||0))*.15; plant(g, cx, cy, s, T.bloom, t); }
    else if (T.type==='rock') rock(g, cx, cy, s, T.i);
    else if (T.type==='cow') cow(g, cx, cy, s, f.drank.has(T.i), t);
    if (S.hilly && T.h>0) badge(x, y, s, T.h);
    const fl = flashes[T.i]; if (fl && fl > now) glow(x, y, s, (fl-now)/1500, t);
  }
  for (const [i,b] of f.leaks) edgeMark(S.tiles[i], b, s, t, 'leak');
  for (const [i,b] of f.blocked) edgeMark(S.tiles[i], b, s, t, 'uphill');
}

// ---------- ground details ----------
function tufts(x, y, s, seed){
  const R = rng(seed*31+7);
  if (R() < .45){ const px=x+s*(.2+R()*.6), py=y+s*(.25+R()*.55);
    g.strokeStyle='#7fb064'; g.lineWidth=1.5; g.beginPath(); g.moveTo(px,py); g.lineTo(px-s*.04,py-s*.08); g.moveTo(px,py); g.lineTo(px+s*.03,py-s*.09); g.stroke(); }
  if (R() < .18){ const col=['#f7d6e0','#fff3b0','#e2d3f5'][Math.floor(R()*3)], px=x+s*(.2+R()*.6), py=y+s*(.2+R()*.6);
    for (let k=0;k<5;k++){ const a=k*1.2566; ell(g,px+Math.cos(a)*s*.03,py+Math.sin(a)*s*.03,s*.022,s*.022,col); } ell(g,px,py,s*.015,s*.015,'#e6a92e'); }
}
function cracks(x, y, s, seed){
  const R = rng(seed*17+3); g.strokeStyle='#c99a52'; g.lineWidth=1.4;
  for (let k=0;k<3;k++){ let px=x+s*(.1+R()*.8), py=y+s*(.1+R()*.8); g.beginPath(); g.moveTo(px,py);
    for (let j=0;j<3;j++){ px+=(R()-.5)*s*.22; py+=(R()-.5)*s*.22; g.lineTo(px,py); } g.stroke(); }
}
// Dark edges wherever ground drops to a lower tile, thicker for a bigger drop.
function cliffs(S, s){
  const at = (r,c) => (r<0||c<0||r>=S.H||c>=S.W) ? null : S.tiles[r*S.W+c];
  for (const T of S.tiles){ if (!T.h) continue; const x=T.c*s, y=T.r*s;
    g.fillStyle='rgba(255,255,255,.22)'; g.fillRect(x, y, s, 3);
    for (const [b,dr,dc] of DIRS){ const n=at(T.r+dr,T.c+dc); if (!n || n.h>=T.h) continue;
      const w=3+(T.h-n.h)*2.5; g.fillStyle='#6e5230';
      if (b===1) g.fillRect(x, y, s, w); if (b===4) g.fillRect(x, y+s-w, s, w);
      if (b===8) g.fillRect(x, y, w, s); if (b===2) g.fillRect(x+s-w, y, w, s); } }
}
function badge(x, y, s, h){
  const w=s*.36, hh=s*.2; g.beginPath(); g.roundRect(x+3, y+3, w, hh, hh/2); g.fillStyle='#5a4126'; g.fill();
  g.fillStyle='#fff'; g.font=`800 ${Math.round(s*.14)}px Nunito, sans-serif`; g.textAlign='center'; g.textBaseline='middle';
  g.fillText('▲'+h, x+3+w/2, y+3+hh/2+1);
}

// ---------- channels: the same two-tone dirt as Carrot Patch's path, with water on top ----------
const ENDS = [[0,-1],[1,0],[0,1],[-1,0]];
function pipe(T, cx, cy, s, wet, t){
  g.save(); g.translate(cx, cy); g.rotate(T.vis*Math.PI/180);
  const m = T.base;
  const seg = (w, col, dash) => {
    g.strokeStyle=col; g.lineWidth=w; g.lineCap='butt';
    if (dash){ g.setLineDash(dash); g.lineDashOffset = -t*s*.5; }
    g.beginPath(); ENDS.forEach(([dx,dy],k) => { if (m & (1<<k)){ g.moveTo(0,0); g.lineTo(dx*s/2, dy*s/2); } }); g.stroke();
    g.setLineDash([]);
    if (!dash) ell(g, 0, 0, w/2, w/2, col);
  };
  seg(s*.5, '#9c7446'); seg(s*.44, '#b48d5a'); seg(s*.3, '#dcbd8b');
  if (wet) seg(s*.22, '#5aaee0');
  else { const R=rng(T.i*13+5); for (let k=0;k<4;k++){ const a=Math.floor(R()*4); if (!(m&(1<<a))) continue; const d=R()*.4; ell(g, ENDS[a][0]*s*d+(R()-.5)*s*.08, ENDS[a][1]*s*d+(R()-.5)*s*.08, s*.025, s*.018, '#c4a271'); } }
  g.restore();
}
// Little ripples that run the way the water flows: from the side it came in, out through every other opening.
// Drawn once the piece has finished turning, so they always line up with the channel.
function ripples(T, cx, cy, s, inSide, t){
  if (T.vis !== T.rot*90 || !inSide) return;
  const m = rotMask(T.base, T.rot), k0 = [1,2,4,8].indexOf(inSide);
  g.save(); g.strokeStyle='rgba(255,255,255,.75)'; g.lineWidth=s*.05; g.lineCap='butt';
  g.setLineDash([s*.07, s*.17]); g.lineDashOffset = -t*s*.5;
  ENDS.forEach(([dx,dy],k) => { if (!(m & (1<<k)) || k===k0) return;
    g.beginPath(); g.moveTo(cx+ENDS[k0][0]*s/2, cy+ENDS[k0][1]*s/2); g.lineTo(cx, cy); g.lineTo(cx+dx*s/2, cy+dy*s/2); g.stroke(); });
  g.restore();
}
function lockedRim(x, y, s){
  g.beginPath(); g.roundRect(x+3, y+3, s-6, s-6, 9); g.strokeStyle='#8f9a86'; g.lineWidth=3; g.stroke();
  for (const [px,py] of [[x+7,y+7],[x+s-7,y+7],[x+7,y+s-7],[x+s-7,y+s-7]]) ell(g, px, py, s*.06, s*.05, '#a7aa9c', '#6d7064', 1.2);
}
function windmill(x, y, s, wet, t){
  g.strokeStyle='#5e3d20'; g.lineWidth=2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y+s*.2); g.stroke();
  g.save(); g.translate(x, y); g.rotate(wet ? t*5 : .3);
  for (let k=0;k<4;k++){ g.rotate(1.5708); g.beginPath(); g.moveTo(0,0); g.lineTo(-s*.035, -s*.15); g.lineTo(s*.035, -s*.15); g.closePath(); g.fillStyle='#f3ead8'; g.fill(); g.strokeStyle='#8a5a3a'; g.lineWidth=1.2; g.stroke(); }
  g.restore(); ell(g, x, y, s*.03, s*.03, '#c2456b', '#5e3d20', 1);
}
function edgeMark(T, b, s, t, kind){
  const k = [1,2,4,8].indexOf(b), cx = T.c*s+s/2 + ENDS[k][0]*s*.5, cy = T.r*s+s/2 + ENDS[k][1]*s*.5;
  const p = 1 + .12*Math.sin(t*6 + T.i);
  if (kind==='leak'){ ell(g, cx, cy, s*.1*p, s*.12*p, '#5aaee0', '#ffffff', 2); ell(g, cx-s*.03, cy-s*.04, s*.025, s*.03, 'rgba(255,255,255,.85)'); return; }
  ell(g, cx, cy, s*.13*p, s*.13*p, '#d64545', '#ffffff', 2);
  g.fillStyle='#fff'; g.font=`800 ${Math.round(s*.14)}px Nunito, sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText('▲', cx, cy+1);
}
function glow(x, y, s, left, t){
  g.save(); g.globalAlpha = Math.min(1, left*1.6) * (.6 + .4*Math.sin(t*10));
  g.beginPath(); g.roundRect(x+2, y+2, s-4, s-4, 10); g.strokeStyle='#f0913f'; g.lineWidth=4; g.stroke(); g.restore();
}

// ---------- things on the board (also used for the small pictures on the home screen) ----------
const shadow = (c, x, y, rx, ry) => ell(c, x, y, rx, ry, 'rgba(40,60,20,.25)');
export function barrel(c, cx, cy, s){
  shadow(c, cx, cy+s*.34, s*.3, s*.07);
  c.beginPath(); c.roundRect(cx-s*.26, cy-s*.3, s*.52, s*.62, s*.12); c.fillStyle='#b07a45'; c.fill(); c.strokeStyle='#6e4422'; c.lineWidth=2; c.stroke();
  c.strokeStyle='#94622f'; c.lineWidth=1.4; for (const dx of [-.1,.1]){ c.beginPath(); c.moveTo(cx+dx*s, cy-s*.26); c.lineTo(cx+dx*s, cy+s*.3); c.stroke(); }
  for (const dy of [-.14,.16]){ c.fillStyle='#7d7d73'; c.fillRect(cx-s*.27, cy+dy*s, s*.54, s*.06); }
  ell(c, cx, cy-s*.3, s*.25, s*.08, '#5aaee0', '#6e4422', 2); ell(c, cx-s*.07, cy-s*.32, s*.07, s*.022, 'rgba(255,255,255,.8)');
}
export function plant(c, cx, cy, s, bloom=0, t=0){
  ell(c, cx, cy+s*.3, s*.27, s*.09, '#9b6b43', '#6e4a2c', 1.2); ell(c, cx-s*.05, cy+s*.28, s*.12, s*.03, '#b07d51');
  if (bloom < .5){   // dry and droopy
    c.globalAlpha = 1 - bloom*2; c.strokeStyle='#9a7a45'; c.lineWidth=Math.max(2,s*.05);
    c.beginPath(); c.moveTo(cx, cy+s*.28); c.quadraticCurveTo(cx-s*.03, cy+s*.1, cx+s*.04, cy-s*.02); c.stroke();
    c.lineWidth=Math.max(1.5,s*.035); c.beginPath(); c.moveTo(cx, cy+s*.14); c.quadraticCurveTo(cx-s*.12, cy+s*.15, cx-s*.15, cy+s*.25);
    c.moveTo(cx+s*.01, cy+s*.08); c.quadraticCurveTo(cx+s*.13, cy+s*.12, cx+s*.16, cy+s*.22); c.stroke(); c.globalAlpha=1;
  }
  if (bloom > .02){
    const k = Math.min(1, bloom), sway = Math.sin(t*1.6 + cx)*s*.015;
    c.save(); c.translate(cx, cy+s*.28); c.scale(k, k);
    c.strokeStyle='#4f8a3c'; c.lineWidth=Math.max(2,s*.05); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-s*.02, -s*.25, sway, -s*.42); c.stroke();
    ell(c, -s*.11, -s*.16, s*.1, s*.045, '#6fae54', '#3f7a2a', 1); ell(c, s*.11, -s*.22, s*.1, s*.045, '#6fae54', '#3f7a2a', 1);
    c.translate(sway, -s*.48);
    for (let p=0;p<5;p++){ const a=p*1.2566-1.57; ell(c, Math.cos(a)*s*.09, Math.sin(a)*s*.09, s*.075, s*.075, '#f48fb1', '#c2456b', 1); }
    ell(c, 0, 0, s*.06, s*.06, '#f6c344', '#a07a10', 1); ell(c, -s*.02, -s*.02, s*.018, s*.018, 'rgba(255,255,255,.8)');
    c.restore();
  }
}
export function rock(c, cx, cy, s, seed=1){
  const R = rng(seed*7+11);
  shadow(c, cx, cy+s*.24, s*.36, s*.1);
  c.beginPath(); const n=7, rad=s*.32;
  for (let k=0;k<n;k++){ const a=k/n*6.283+R()*.3, rk=rad*(.8+R()*.25); c.lineTo(cx+Math.cos(a)*rk, cy+s*.04+Math.sin(a)*rk*.75); }
  c.closePath(); c.fillStyle='#a7aa9c'; c.fill(); c.strokeStyle='#6d7064'; c.lineWidth=1.5; c.stroke();
  ell(c, cx-s*.08, cy-s*.06, s*.12, s*.07, '#c2c5b6');
  c.strokeStyle='#85887a'; c.lineWidth=1; c.beginPath(); c.moveTo(cx+s*.04, cy+s*.02); c.lineTo(cx+s*.13, cy+s*.12); c.stroke();
}
export function cow(c, cx, cy, s, drinking=false, t=0){
  shadow(c, cx, cy+s*.32, s*.34, s*.07);
  c.fillStyle='#4a4a44'; for (const dx of [-.2,-.08,.08,.18]) { c.beginPath(); c.roundRect(cx+dx*s-s*.03, cy+s*.1, s*.06, s*.2, s*.02); c.fill(); }
  ell(c, cx-s*.03, cy+s*.04, s*.3, s*.17, '#fbfbf5', '#4a4a44', 1.6);
  ell(c, cx-s*.12, cy, s*.08, s*.06, '#3a3a34'); ell(c, cx+s*.08, cy+s*.08, s*.06, s*.045, '#3a3a34');
  c.strokeStyle='#4a4a44'; c.lineWidth=2; c.beginPath(); c.moveTo(cx-s*.32, cy); c.quadraticCurveTo(cx-s*.4, cy+s*.08, cx-s*.36, cy+s*.18); c.stroke();
  const hy = drinking ? cy+s*.1 + Math.sin(t*5)*s*.015 : cy-s*.06;
  c.strokeStyle='#c9a46a'; c.lineWidth=2.5; c.beginPath(); c.moveTo(cx+s*.2, hy-s*.1); c.lineTo(cx+s*.16, hy-s*.18); c.moveTo(cx+s*.34, hy-s*.1); c.lineTo(cx+s*.38, hy-s*.18); c.stroke();
  ell(c, cx+s*.27, hy, s*.13, s*.12, '#fbfbf5', '#4a4a44', 1.6);
  ell(c, cx+s*.3, hy+s*.07, s*.09, s*.06, '#f4a7b9', '#4a4a44', 1.2);
  ell(c, cx+s*.24, hy-s*.03, s*.02, s*.02, '#2a2a24');
  if (drinking){
    ell(c, cx+s*.38, hy+s*.18, s*.05, s*.06, '#5aaee0', '#ffffff', 1.5);
    c.fillStyle='#1f6fa0'; c.font=`800 ${Math.round(s*.16)}px Nunito, sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('-2', cx-s*.24, cy-s*.3);
  }
}
export function sun(c, cx, cy, s){
  c.strokeStyle='#e0a21c'; c.lineWidth=2; for (let k=0;k<8;k++){ const a=k*.785; c.beginPath(); c.moveTo(cx+Math.cos(a)*s*.26, cy+Math.sin(a)*s*.26); c.lineTo(cx+Math.cos(a)*s*.36, cy+Math.sin(a)*s*.36); c.stroke(); }
  ell(c, cx, cy, s*.2, s*.2, '#f6c344', '#a07a10', 1.5); ell(c, cx-s*.06, cy-s*.06, s*.05, s*.05, 'rgba(255,255,255,.7)');
}
export function hill(c, cx, cy, s){
  ell(c, cx, cy+s*.2, s*.42, s*.22, '#93c179', '#5f8f45', 1.5); ell(c, cx+s*.05, cy+s*.05, s*.3, s*.22, '#c4dc88', '#7fa84f', 1.5);
  ell(c, cx-s*.05, cy-s*.05, s*.12, s*.06, 'rgba(255,255,255,.4)'); windmill(cx+s*.15, cy-s*.12, s*.9, true, 0);
}
// Small picture for a garden card on the home screen.
export function drawIcon(cnv, kind){
  const c = cnv.getContext('2d'), s = cnv.width/2;
  c.setTransform(2,0,0,2,0,0); c.clearRect(0,0,cnv.width,cnv.height); c.lineJoin='round'; c.lineCap='round';
  const cx=s/2, cy=s/2;
  if (kind==='barrel') barrel(c, cx, cy, s*.95);
  else if (kind==='sun') sun(c, cx, cy, s);
  else if (kind==='cow') cow(c, cx-s*.06, cy, s*.95);
  else if (kind==='hill') { const save=g; g=c; hill(c, cx, cy, s); g=save; }
}
