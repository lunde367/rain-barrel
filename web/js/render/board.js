// The garden board, drawn on a canvas in the family art style (soft round shapes, darker outlines,
// small white highlights), with the same grass and dirt colors as Carrot Patch.
import { G } from '../engine/game.js';
import { ell, rng } from '../../kit/js/draw.js';
import { DIRS, rotMask } from '../engine/flow.js';

let cv, g, boardEl, tile = 60, W = 0, H = 0, dpr = 1;
const flashes = {};                 // tile index → time the hint glow ends
let selected = null;                // tray piece the player picked up, if any
export const setSelected = k => { selected = k; };

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
  if (S.hilly && !S.hillLabels) S.hillLabels = hillLabels(S);

  for (const T of S.tiles){
    const x=T.c*s, y=T.r*s;
    g.fillStyle = groundColor(S, T); g.fillRect(x, y, s, s);
    if (T.hot) cracks(x, y, s, T.i);
    else if (T.type==='grass') tufts(x, y, s, T.i);
  }
  if (S.hilly) cliffs(S, s);

  for (const T of S.tiles){
    const x=T.c*s, y=T.r*s, cx=x+s/2, cy=y+s/2;
    if (T.slot) slotPatch(x, y, s, T.type==='slot' && selected!=null, t);
    if (T.type==='pipe'){
      const target = T.rot*90; if (T.vis==null) T.vis = target;
      T.vis += (target - T.vis) * .35; if (Math.abs(target - T.vis) < .5) T.vis = target;
      if (T.locked) lockedRim(x, y, s);
      pipe(T, cx, cy, s, f.wet.has(T.i), t);
      if (f.wet.has(T.i)) ripples(T, cx, cy, s, f.entry[T.i], t);
      if (T.pump) windmill(x+s*.8, y+s*.2, s, f.wet.has(T.i), t);
      if (T.link) linkMark(x, y, s, T.link);
    }
    else if (T.type==='src') source(G.LV.src || 'barrel', cx, cy, s, outlets(S, T, f), t);
    else if (T.type==='plant'){ T.bloom = (T.bloom||0) + ((f.watered.has(T.i)?1:0) - (T.bloom||0))*.15; plant(g, cx, cy, s, T.bloom, t); }
    else if (T.type==='rock') rock(g, cx, cy, s, T.i);
    else if (T.type==='cow') cow(g, cx, cy, s, f.drank.has(T.i), t);
    else if (T.type==='cactus') cactus(g, cx, cy, s, f.soaked.has(T.i), t);
    if (S.hilly && T.h>0 && S.hillLabels.has(T.i)) badge(x, y, s, T.h);
    const fl = flashes[T.i]; if (fl && fl > now) glow(x, y, s, (fl-now)/1500, t);
  }
  for (const [i,b] of f.leaks) edgeMark(S.tiles[i], b, s, t, 'leak');
  for (const [i,b] of f.blocked) edgeMark(S.tiles[i], b, s, t, 'uphill');
}

// ---------- tray slots and linked pieces ----------
// An empty slot is a dug patch of soil; it pulses when a tray piece is ready to be placed.
function slotPatch(x, y, s, ready, t){
  g.save(); g.beginPath(); g.roundRect(x+s*.1, y+s*.1, s*.8, s*.8, s*.12);
  g.fillStyle='#c9a76c'; g.fill();
  g.setLineDash([s*.07, s*.05]); g.strokeStyle = ready ? '#f0913f' : '#8a6a4a'; g.lineWidth = ready ? 3 + Math.sin(t*6) : 2; g.stroke();
  g.restore();
}
// Linked pieces carry a little flower in their group's color.
const LINK_COLOR = { a:'#c2456b', b:'#6f5bd4', c:'#e0a21c', d:'#2a9d8f' };
function linkMark(x, y, s, link){
  const px = x+s*.82, py = y+s*.82, r = s*.07, col = LINK_COLOR[link] || '#c2456b';
  for (let k=0;k<5;k++){ const a=k*1.2566-1.57; ell(g, px+Math.cos(a)*r*1.2, py+Math.sin(a)*r*1.2, r, r, col, 'rgba(0,0,0,.35)', 1); }
  ell(g, px, py, r*.8, r*.8, '#fff3b0', 'rgba(0,0,0,.35)', 1);
}
export { LINK_COLOR };
// A tray piece drawn on its own little canvas.
export function drawPiece(cnv, base, rot){
  const save = g, c = cnv.getContext('2d'), s = cnv.width/2; g = c;
  c.setTransform(2,0,0,2,0,0); c.clearRect(0,0,cnv.width,cnv.height); c.lineJoin='round'; c.lineCap='round';
  pipe({ base, vis:rot*90, i:base }, s/2, s/2, s*.95, false, 0);
  g = save;
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
// One ▲ label per hill area (a connected patch of the same height), on its top-left tile,
// instead of one on every tile. Colors and cliff edges show the rest.
function hillLabels(S){
  const at = (r,c) => (r<0||c<0||r>=S.H||c>=S.W) ? null : S.tiles[r*S.W+c], seen = new Set(), out = new Set();
  for (const T of S.tiles){ if (!T.h || seen.has(T.i)) continue;
    const q = [T]; seen.add(T.i); let first = T;
    while (q.length){ const x = q.shift(); if (x.r < first.r || (x.r===first.r && x.c < first.c)) first = x;
      for (const [,dr,dc] of DIRS){ const n = at(x.r+dr, x.c+dc); if (n && n.h===T.h && !seen.has(n.i)){ seen.add(n.i); q.push(n); } } }
    out.add(first.i); }
  return out;
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
  if (kind==='leak'){ splash(cx, cy, ENDS[k][0], ENDS[k][1], s, t + T.i*.37); return; }
  ell(g, cx, cy, s*.13*p, s*.13*p, '#d64545', '#ffffff', 2);
  g.fillStyle='#fff'; g.font=`800 ${Math.round(s*.14)}px Nunito, sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText('▲', cx, cy+1);
}
// A leak: water pours out of the open channel end into one soft, uneven puddle,
// with teardrop drips running off it.
function splash(cx, cy, dx, dy, s, t){
  const px = -dy, py = dx;                         // sideways from the spill direction
  const P = (along, side) => [cx + dx*along*s + px*side*s, cy + dy*along*s + py*side*s];
  g.save();
  // the puddle: one wobbly outline, see-through so the grass shows a little
  const n = 10, pts = [];
  for (let k=0; k<n; k++){
    const a = k/n*6.283, wob = 1 + .14*Math.sin(a*3 + 1.3) + .05*Math.sin(t*2.2 + a*2);
    pts.push(P(.13 + Math.cos(a)*.11*wob, Math.sin(a)*.17*wob));
  }
  g.beginPath();
  for (let k=0; k<n; k++){
    const [x1,y1] = pts[k], [x2,y2] = pts[(k+1)%n], mx=(x1+x2)/2, my=(y1+y2)/2;
    if (k===0) g.moveTo(mx, my); else g.quadraticCurveTo(x1, y1, mx, my);
  }
  g.quadraticCurveTo(...pts[0], ...(([x1,y1],[x2,y2]) => [(x1+x2)/2,(y1+y2)/2])(pts[0], pts[1]));
  g.closePath(); g.fillStyle='rgba(90,174,224,.6)'; g.fill(); g.strokeStyle='rgba(58,134,184,.55)'; g.lineWidth=1.5; g.stroke();
  // a glint on the water
  const [gx,gy] = P(.1, -.05); g.strokeStyle='rgba(255,255,255,.7)'; g.lineWidth=2; g.lineCap='round';
  g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + px*s*.06, gy + py*s*.06); g.stroke();
  // water spilling out of the opening
  const [sx,sy] = P(-.02, 0), [ex,ey] = P(.12, 0);
  g.strokeStyle='#5aaee0'; g.lineWidth=s*.1; g.lineCap='butt'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
  // teardrop drips running away, fading as they go
  for (let k=0; k<3; k++){
    const d = (t*1.1 + k/3) % 1, [x,y] = P(.2 + d*.28, (k-1)*.11);
    g.globalAlpha = 1 - d; drop(x, y, dx, dy, s*.045);
  }
  g.restore();
}
// A teardrop pointing the way it's moving.
function drop(x, y, dx, dy, r){
  g.save(); g.translate(x, y); g.rotate(Math.atan2(dy, dx));
  g.beginPath(); g.moveTo(r*1.6, 0); g.quadraticCurveTo(r*.2, -r, -r*.6, -r*.6); g.arc(-r*.4, 0, r*.65, -Math.PI/2, Math.PI/2, true);
  g.quadraticCurveTo(r*.2, r, r*1.6, 0); g.closePath();
  g.fillStyle='#5aaee0'; g.fill(); g.strokeStyle='rgba(58,134,184,.8)'; g.lineWidth=1; g.stroke(); g.restore();
}
function glow(x, y, s, left, t){
  g.save(); g.globalAlpha = Math.min(1, left*1.6) * (.6 + .4*Math.sin(t*10));
  g.beginPath(); g.roundRect(x+2, y+2, s-4, s-4, 10); g.strokeStyle='#f0913f'; g.lineWidth=4; g.stroke(); g.restore();
}

// ---------- water sources ----------
// Sides where a channel connects to this source and carries water (N=1, E=2, S=4, W=8).
function outlets(S, T, f){
  const at = (r,c) => (r<0||c<0||r>=S.H||c>=S.W) ? null : S.tiles[r*S.W+c], out = [];
  for (const [b,dr,dc] of DIRS){ const n = at(T.r+dr, T.c+dc);
    if (n && n.type==='pipe' && f.wet.has(n.i) && (rotMask(n.base, n.rot) & ({1:4,2:8,4:1,8:2})[b])) out.push(b); }
  return out;
}
const ANGLE = { 1:-Math.PI/2, 2:0, 4:Math.PI/2, 8:Math.PI };
// Each source has an outlet (spigot, hose, stream) pointing at every connected channel.
// With nothing connected it shows one dry outlet facing down.
function source(kind, cx, cy, s, sides, t){
  const list = sides.length ? sides : [4], wet = sides.length > 0;
  const body = BODY[kind] || BODY.barrel, outlet = OUTLET[kind] || OUTLET.barrel;
  // outlets behind the body for the top side, in front for the others
  for (const b of list) if (b===1) withDir(cx, cy, b, () => outlet(s, wet, t));
  body(g, cx, cy, s, t);
  for (const b of list) if (b!==1) withDir(cx, cy, b, () => outlet(s, wet, t));
}
function withDir(cx, cy, b, fn){ g.save(); g.translate(cx, cy); g.rotate(ANGLE[b]); fn(); g.restore(); }
// A stream of water from an outlet's tip to the tile edge, with ripples running outward.
function stream(x0, s, w, t){
  g.strokeStyle='#5aaee0'; g.lineWidth=w; g.lineCap='butt'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(s*.5, 0); g.stroke();
  g.strokeStyle='rgba(255,255,255,.75)'; g.lineWidth=w*.25; g.setLineDash([s*.05, s*.09]); g.lineDashOffset=-t*s*.5;
  g.beginPath(); g.moveTo(x0, 0); g.lineTo(s*.5, 0); g.stroke(); g.setLineDash([]);
}
const OUTLET = {
  // brass spigot with a little wheel handle
  barrel(s, wet, t){
    if (wet) stream(s*.36, s, s*.13, t);
    g.beginPath(); g.roundRect(s*.2, -s*.055, s*.2, s*.11, s*.03); g.fillStyle='#d9a441'; g.fill(); g.strokeStyle='#7a5a1a'; g.lineWidth=1.4; g.stroke();
    g.beginPath(); g.roundRect(s*.36, -s*.075, s*.07, s*.15, s*.02); g.fillStyle='#c48f2c'; g.fill(); g.stroke();
    g.strokeStyle='#7a5a1a'; g.lineWidth=2; g.beginPath(); g.moveTo(s*.29, -s*.055); g.lineTo(s*.29, -s*.13); g.stroke();
    ell(g, s*.29, -s*.14, s*.05, s*.022, '#c2456b', '#7a2a40', 1.2);
    ell(g, s*.25, -s*.025, s*.03, s*.012, 'rgba(255,255,255,.6)');
  },
  // green garden hose with a nozzle
  house(s, wet, t){
    if (wet) stream(s*.42, s, s*.1, t);
    g.strokeStyle='#2f7a3a'; g.lineWidth=s*.09; g.lineCap='round';
    g.beginPath(); g.moveTo(s*.05, s*.18); g.bezierCurveTo(s*.3, s*.3, s*.12, -s*.12, s*.38, 0); g.stroke();
    g.strokeStyle='#5fb34a'; g.lineWidth=s*.05; g.stroke();
    g.beginPath(); g.roundRect(s*.34, -s*.05, s*.12, s*.1, s*.02); g.fillStyle='#e0a21c'; g.fill(); g.strokeStyle='#7a5a1a'; g.lineWidth=1.3; g.stroke();
  },
  // a little channel cut through the bank
  pond(s, wet, t){
    g.fillStyle='#c9a76c'; g.fillRect(s*.2, -s*.1, s*.3, s*.2);
    if (wet) stream(s*.2, s, s*.14, t); else { g.fillStyle='#b48d5a'; g.fillRect(s*.2, -s*.06, s*.3, s*.12); }
  },
  // wooden trough
  well(s, wet, t){
    if (wet) stream(s*.36, s, s*.11, t);
    g.beginPath(); g.roundRect(s*.18, -s*.075, s*.24, s*.15, s*.02); g.fillStyle='#a0703f'; g.fill(); g.strokeStyle='#5e3d20'; g.lineWidth=1.4; g.stroke();
    if (wet){ g.fillStyle='#5aaee0'; g.fillRect(s*.2, -s*.035, s*.2, s*.07); }
  },
};
OUTLET.barn = OUTLET.house; OUTLET.river = OUTLET.pond;
const BODY = {
  barrel: (c, cx, cy, s) => barrel(c, cx, cy, s*.92),
  house(c, cx, cy, s){ cottage(c, cx, cy, s, '#f3ead8', '#c2456b', '#8a6a4a'); },
  barn(c, cx, cy, s){ cottage(c, cx, cy, s, '#c94b3c', '#6e3a2a', '#f3ead8', true); },
  pond(c, cx, cy, s, t){
    ell(c, cx, cy, s*.4, s*.3, '#e5d3a3', '#b8a070', 1.5); ell(c, cx, cy, s*.33, s*.23, '#5aaee0', '#3a86b8', 1.5);
    ell(c, cx-s*.1, cy-s*.06, s*.1, s*.03, 'rgba(255,255,255,.55)');
    ell(c, cx+s*.12, cy+s*.06, s*.07, s*.045, '#6fae54', '#3f7a2a', 1); ell(c, cx+s*.14, cy+s*.04, s*.02, s*.02, '#f48fb1');
    c.strokeStyle='#4f8a3c'; c.lineWidth=2; for (const dx of [-.3,-.26,-.22]){ c.beginPath(); c.moveTo(cx+dx*s, cy+s*.2); c.lineTo(cx+dx*s+Math.sin(t*2+dx*9)*s*.01, cy-s*.02); c.stroke(); }
    ell(c, cx-s*.26, cy-s*.03, s*.015, s*.05, '#8a5a3a');
  },
  river(c, cx, cy, s, t){
    const x0=cx-s/2, y0=cy-s/2;
    c.fillStyle='#e5d3a3'; c.beginPath(); c.moveTo(x0, y0+s*.08); c.bezierCurveTo(x0+s*.4, y0+s*.2, x0+s*.6, y0+s*.75, x0+s, y0+s*.9); c.lineTo(x0+s, y0+s*.5);
    c.bezierCurveTo(x0+s*.7, y0+s*.4, x0+s*.5, y0-s*.05, x0+s*.1, y0); c.closePath(); c.fill();
    c.fillStyle='#5aaee0'; c.beginPath(); c.moveTo(x0, y0+s*.12); c.bezierCurveTo(x0+s*.4, y0+s*.24, x0+s*.6, y0+s*.7, x0+s, y0+s*.84); c.lineTo(x0+s, y0+s*.56);
    c.bezierCurveTo(x0+s*.68, y0+s*.46, x0+s*.48, y0+s*.02, x0+s*.12, y0); c.lineTo(x0, y0); c.closePath(); c.fill();
    c.strokeStyle='#3a86b8'; c.lineWidth=1.3; c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=2; c.setLineDash([s*.06, s*.1]); c.lineDashOffset=-t*s*.4;
    c.beginPath(); c.moveTo(x0+s*.05, y0+s*.05); c.bezierCurveTo(x0+s*.4, y0+s*.15, x0+s*.58, y0+s*.6, x0+s, y0+s*.7); c.stroke(); c.setLineDash([]);
    rock(c, x0+s*.82, y0+s*.2, s*.35, 5);
  },
  well(c, cx, cy, s){
    ell(c, cx, cy+s*.28, s*.3, s*.07, 'rgba(40,60,20,.25)');
    c.strokeStyle='#5e3d20'; c.lineWidth=3; c.beginPath(); c.moveTo(cx-s*.22, cy+s*.1); c.lineTo(cx-s*.22, cy-s*.3); c.moveTo(cx+s*.22, cy+s*.1); c.lineTo(cx+s*.22, cy-s*.3); c.stroke();
    c.beginPath(); c.moveTo(cx-s*.32, cy-s*.26); c.lineTo(cx, cy-s*.42); c.lineTo(cx+s*.32, cy-s*.26); c.closePath(); c.fillStyle='#c94b3c'; c.fill(); c.strokeStyle='#6e3a2a'; c.lineWidth=1.5; c.stroke();
    c.beginPath(); c.roundRect(cx-s*.26, cy-s*.04, s*.52, s*.3, s*.06); c.fillStyle='#a7aa9c'; c.fill(); c.strokeStyle='#6d7064'; c.lineWidth=1.5; c.stroke();
    c.strokeStyle='#85887a'; c.lineWidth=1; for (const dy of [.06,.16]){ c.beginPath(); c.moveTo(cx-s*.26, cy+dy*s); c.lineTo(cx+s*.26, cy+dy*s); c.stroke(); }
    ell(c, cx, cy-s*.04, s*.24, s*.06, '#2f4a5a', '#6d7064', 1.5); ell(c, cx-s*.06, cy-s*.05, s*.06, s*.015, 'rgba(120,190,230,.6)');
    c.strokeStyle='#8a6a4a'; c.lineWidth=1.2; c.beginPath(); c.moveTo(cx+s*.06, cy-s*.3); c.lineTo(cx+s*.06, cy-s*.16); c.stroke();
    c.beginPath(); c.roundRect(cx+s*.02, cy-s*.17, s*.08, s*.07, s*.015); c.fillStyle='#a0703f'; c.fill(); c.strokeStyle='#5e3d20'; c.stroke();
  },
};
function shedIcon(c, cx, cy, s){
  cottage(c, cx, cy+s*.02, s*.95, '#c9a76c', '#6f5bd4', '#f3ead8', false);
  c.fillStyle='#f6c344'; c.font=`800 ${Math.round(s*.22)}px Nunito, sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('★', cx, cy-s*.18);
}
function cottage(c, cx, cy, s, wall, roof, trim, barn=false){
  ell(c, cx, cy+s*.3, s*.32, s*.07, 'rgba(40,60,20,.25)');
  c.beginPath(); c.rect(cx-s*.26, cy-s*.08, s*.52, s*.38); c.fillStyle=wall; c.fill(); c.strokeStyle='#5e3d20'; c.lineWidth=1.5; c.stroke();
  c.beginPath(); c.moveTo(cx-s*.34, cy-s*.06); c.lineTo(cx, cy-s*.38); c.lineTo(cx+s*.34, cy-s*.06); c.closePath(); c.fillStyle=roof; c.fill(); c.stroke();
  if (barn){
    c.beginPath(); c.rect(cx-s*.1, cy+s*.06, s*.2, s*.24); c.fillStyle='#8a3a2e'; c.fill(); c.strokeStyle=trim; c.lineWidth=2; c.stroke();
    c.beginPath(); c.moveTo(cx-s*.1, cy+s*.06); c.lineTo(cx+s*.1, cy+s*.3); c.moveTo(cx+s*.1, cy+s*.06); c.lineTo(cx-s*.1, cy+s*.3); c.stroke();
    ell(c, cx, cy-s*.17, s*.05, s*.05, trim, '#5e3d20', 1);
  } else {
    c.beginPath(); c.roundRect(cx-s*.06, cy+s*.1, s*.12, s*.2, [s*.06, s*.06, 0, 0]); c.fillStyle=trim; c.fill(); c.strokeStyle='#5e3d20'; c.lineWidth=1.2; c.stroke();
    c.beginPath(); c.rect(cx+s*.1, cy+s*.0, s*.1, s*.09); c.fillStyle='#bfe3f2'; c.fill(); c.stroke();
    c.beginPath(); c.rect(cx-s*.2, cy+s*.0, s*.1, s*.09); c.fill(); c.stroke();
  }
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
    // "-2" in a white bubble, big enough to read on a phone
    const bx = cx-s*.22, by = cy-s*.3, bw = s*.36, bh = s*.24;
    c.beginPath(); c.roundRect(bx-bw/2, by-bh/2, bw, bh, bh/2); c.fillStyle='#ffffff'; c.fill(); c.strokeStyle='#3a86b8'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#1f6fa0'; c.font=`800 ${Math.round(s*.2)}px Nunito, sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('−2', bx, by+1);
  }
}
// A cactus in sandy soil: happy when dry, droopy and dripping when water reaches it.
export function cactus(c, cx, cy, s, wet=false, t=0){
  ell(c, cx, cy+s*.3, s*.27, s*.08, '#e5d3a3', '#b8a070', 1.2);
  const body = wet ? '#7c8f4a' : '#5fa04a', edge = wet ? '#4f5f2a' : '#3f7a2a';
  c.save(); if (wet){ c.translate(cx, cy+s*.28); c.rotate(.18); c.translate(-cx, -(cy+s*.28)); }
  c.beginPath(); c.roundRect(cx-s*.08, cy-s*.3, s*.16, s*.6, s*.08); c.fillStyle=body; c.fill(); c.strokeStyle=edge; c.lineWidth=1.5; c.stroke();
  c.beginPath(); c.roundRect(cx-s*.24, cy-s*.12, s*.1, s*.24, s*.05); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(cx+s*.14, cy-s*.2, s*.1, s*.22, s*.05); c.fill(); c.stroke();
  c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=1; for (const dy of [-.2,-.05,.1]){ c.beginPath(); c.moveTo(cx-s*.03, cy+dy*s); c.lineTo(cx-s*.06, cy+dy*s-s*.03); c.moveTo(cx+s*.03, cy+dy*s); c.lineTo(cx+s*.06, cy+dy*s-s*.03); c.stroke(); }
  if (!wet) { for (let k=0;k<5;k++){ const a=k*1.2566-1.57; ell(c, cx+Math.cos(a)*s*.045, cy-s*.33+Math.sin(a)*s*.045, s*.035, s*.035, '#f48fb1', '#c2456b', .8); } ell(c, cx, cy-s*.33, s*.025, s*.025, '#f6c344'); }
  c.restore();
  if (wet){ const d = (t*1.2)%1; ell(c, cx+s*.18, cy-s*.05+d*s*.3, s*.035, s*.045, '#5aaee0', '#3a86b8', 1);
    c.fillStyle='#3a86b8'; c.font=`800 ${Math.round(s*.2)}px Nunito, sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('!', cx-s*.25, cy-s*.3); }
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
  else if (kind==='cactus') cactus(c, cx, cy, s*.95);
  else if (kind==='tray' || kind==='link'){ const save=g; g=c; c.beginPath(); c.roundRect(s*.12, s*.12, s*.76, s*.76, s*.1); c.fillStyle='#c9a76c'; c.fill();
    c.setLineDash([s*.07,s*.05]); c.strokeStyle='#8a6a4a'; c.lineWidth=1.5; c.stroke(); c.setLineDash([]);
    pipe({ base:kind==='tray'?6:10, vis:0, i:1 }, cx, cy, s*.8, kind==='link', 0); if (kind==='link') linkMark(0, 0, s, 'a'); g=save; }
  else if (kind==='shed') shedIcon(c, cx, cy, s);
}
