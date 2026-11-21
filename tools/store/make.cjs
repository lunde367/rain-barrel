// Makes the store screenshots and the Google Play feature graphic from the real game.
// Usage (needs Playwright):  serve the project root (e.g.  python3 -m http.server 8767),  then
//   node tools/store/make.cjs          (CHROME_PATH=/path/to/chrome to use an installed Chrome)
// Output goes to store/. Sizes (App Store Connect, checked Nov 2026): iPhone with Dynamic Island, medium
// display (1206×2622, required), large display (1290×2796, optional), iPad 13" (2048×2732, required when the
// app runs on iPad). Google Play phone: 1080×1920 (Play wants the long side at most twice the short side).
// Check the sizes each store currently asks for before uploading; they change from time to time.
const { chromium } = require('playwright');
const base = process.env.GAME_URL || 'http://localhost:8767';
const DEVICES = [
  ['iphone-medium', { width:402, height:874 }, 3],
  ['iphone',  { width:430, height:932 }, 3],
  ['ipad',    { width:1024, height:1366 }, 2],
  ['android', { width:360, height:640 }, 3],
];
// A well-played save: most levels have 3 stars, so every garden and the Puzzle Shed show.
const SAVE = () => ({ v:1, stars:Array.from({ length:22 }, (_, i) => (i % 5 === 3 ? 2 : 3)), tutorialDone:true, jar:3,
  settings:{ sfx:false, music:false, haptics:true, calm:true }, fold:{},
  seen:{ leakTip:true, hintTip:true, cactusTip:true, trayTip:true, linkedTip:true }, stats:{ wins:40, hints:6 } });
// Open a level and turn some of its pieces the right way (through the game, like taps), so the
// screenshot shows water on its way. Done levels get their results card hidden for the picture.
const midway = async (p, gi, fixes) => p.evaluate(async ({ gi, fixes }) => {
  const ui = await import('/web/js/ui/ui.js'), g = await import('/web/js/engine/game.js');
  ui.play(gi); const S = g.G.S;
  let n = 0; for (const i of S.solOrder){ if (n >= fixes || S.done) break; const t = S.tiles[i];
    if (t.type==='pipe' && !t.locked){ const k = g.needed(S, t); if (k){ for (let j=0; j<k; j++) g.turn(i); n++; } } }
}, { gi, fixes });
const SCENES = [
  ['1-pasture', async p => midway(p, 12, 99)],                 // Pasture Problem, solved: cows and the long way round
  ['2-long-way', async p => midway(p, 7, 5)],                  // Long Way Round, halfway there
  ['3-hills', async p => midway(p, 15, 99)],                   // High Pasture solved: hills, a pump, cows
  ['4-gardens', async p => { await p.evaluate(async () => (await import('/web/js/ui/ui.js')).showMenu()); }],
  ['5-shed', async p => midway(p, 16, 99)],                    // Puzzle Shed: a big bonus board
];
(async () => {
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath:process.env.CHROME_PATH } : {});
  for (const [name, viewport, scale] of DEVICES){
    const ctx = await b.newContext({ viewport, deviceScaleFactor:scale, isMobile:true, hasTouch:true });
    await ctx.addInitScript(save => { try { if (!sessionStorage.getItem('rb-shot')){ sessionStorage.setItem('rb-shot','1'); localStorage.setItem('rain-barrel-save', save); } } catch {} }, JSON.stringify(SAVE()));
    const p = await ctx.newPage();
    require('fs').mkdirSync(`store/screenshots/${name}`, { recursive:true });
    for (const [scene, run] of SCENES){
      await p.goto(base + '/web/index.html'); await p.waitForTimeout(1500);
      await run(p); await p.waitForTimeout(900);
      await p.evaluate(() => { document.querySelectorAll('.toast,.coach').forEach(t => t.remove()); const o = document.getElementById('over'); if (o) o.hidden = true; });
      await p.waitForTimeout(200);
      const out = `store/screenshots/${name}/${scene}.png`;
      await p.screenshot({ path: out }); console.log('saved', out);
    }
    await ctx.close();
  }
  // Google Play feature graphic, 1024×500
  const p = await b.newPage({ viewport:{ width:1024, height:500 } });
  await p.setContent(`<body style="margin:0;width:1024px;height:500px;display:flex;align-items:center;gap:48px;padding:0 72px;box-sizing:border-box;
      background:linear-gradient(135deg,#9ccfe8,#5aaee0);font-family:'Arial Rounded MT Bold','Nunito',system-ui,sans-serif">
    <img src="${base}/assets/icon.png" style="width:300px;height:300px;border-radius:66px;box-shadow:0 14px 40px rgba(20,50,80,.35)">
    <div><div style="font-size:80px;font-weight:800;line-height:1;color:#1f3a52">Rain<br><span style="color:#fff;text-shadow:0 3px 0 #2c6f9a">Barrel</span></div>
      <div style="font-size:30px;font-weight:700;color:#1f3a52;margin-top:18px">A cozy water puzzle</div></div></body>`);
  await p.waitForTimeout(600); await p.screenshot({ path:'store/feature-graphic.png' }); console.log('saved store/feature-graphic.png');
  await b.close();
})();
