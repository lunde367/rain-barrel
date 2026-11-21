// First-time player check: a robot opens the game with a brand-new save, follows the tutorial by
// tapping the real board, wins the first level, opens the next ones, and uses a hint. It saves a
// screenshot of every step, and fails if the game throws an error, the tutorial stalls, or a level
// can't be won.
//
//   node tools/test/first-play.mjs                 (needs Playwright: npm i -D playwright && npx playwright install chromium)
//   node tools/test/first-play.mjs --device "iPhone SE" --out test-shots
//   CHROME_PATH=/usr/bin/google-chrome node tools/test/first-play.mjs   (use an installed Chrome)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--'+n); return i > 0 ? process.argv[i+1] : d; };
const DEVICE = arg('device', 'Pixel 7'), OUT = arg('out', 'test-shots'), ROOT = new URL('../../web/', import.meta.url).pathname;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = path.endsWith('/') ? path+'index.html' : path;
  try { const body = await readFile(join(ROOT, file));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const URL0 = `http://localhost:${server.address().port}/`;

const problems = [];
const fail = msg => { problems.push(msg); console.log('  ✗ ' + msg); };
const ok = msg => console.log('  ✓ ' + msg);
await mkdir(OUT, { recursive:true });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath:process.env.CHROME_PATH } : {});
const page = await (await browser.newContext({ ...devices[DEVICE], serviceWorkers:'block' })).newPage();
page.on('pageerror', e => fail('page error: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) fail('console error: ' + m.text()); });
let shotN = 0;
const shot = async name => page.screenshot({ path:`${OUT}/${String(++shotN).padStart(2,'0')}-${name}.png` });

// Find a piece on the board that's turned the wrong way and tap it on screen, like a player would.
async function tapAWrongPiece(){
  const target = await page.evaluate(async () => {
    const g = await import('./js/engine/game.js'), S = g.G.S;
    for (const i of S.solOrder){ const t = S.tiles[i]; if (t.type==='pipe' && !t.locked && g.needed(S, t) > 0) return i; }
    return -1;
  });
  if (target < 0) return false;
  const box = await page.locator('#cv').boundingBox(), W = await page.evaluate(async () => (await import('./js/engine/game.js')).G.S.W);
  const s = box.width / W, r = Math.floor(target / W), c = target % W;
  await page.mouse.click(box.x + (c+.5)*s, box.y + (r+.5)*s);
  await page.waitForTimeout(120);
  return true;
}
async function winByTapping(label, maxTaps = 40){
  for (let n=0; n<maxTaps; n++){
    if (await page.locator('#over').isVisible()) break;
    if (!await tapAWrongPiece()) await page.waitForTimeout(300);
  }
  await page.waitForTimeout(900);
  if (await page.locator('#over').isVisible()){ ok(`${label}: won`); await shot(label + '-won'); return true; }
  fail(`${label}: couldn't win by tapping`); await shot(label + '-stuck'); return false;
}

console.log(`First-time player on ${DEVICE}`);
await page.goto(URL0); await page.waitForTimeout(1200);
await shot('home');
if (await page.locator('.continue').count() !== 1) fail('no Start button on a new save');
await page.click('.continue'); await page.waitForTimeout(800);
await shot('tutorial');
if (!await page.locator('.coach').count()) fail('tutorial bubble did not appear'); else ok('tutorial bubble shown');
if (await page.locator('#hint').isVisible()) fail('Hint button should be hidden on level 1');
await winByTapping('level-1');
await page.click('[data-go="next"]'); await page.waitForTimeout(700);
await winByTapping('level-2');
await page.click('.res-icons [data-go="menu"]'); await page.waitForTimeout(500);
const open = await page.locator('.lv:not([disabled])').count();
if (open < 8) fail(`after the tutorial, all Spring Meadow levels should be open (found ${open})`); else ok('Spring Meadow levels open after the tutorial');
await shot('gardens');
await page.click('[data-lv="3"]'); await page.waitForTimeout(900);
if (!await page.locator('#hint').isVisible()) fail('Hint button missing on Spring Meadow 4'); else {
  await page.click('#hint'); await page.waitForTimeout(500); ok('free hint used'); }
await shot('hint');
await winByTapping('level-4');

await browser.close(); server.close();
if (problems.length){ console.log(`\n${problems.length} problem(s) found`); process.exit(1); }
console.log('\nAll good: a new player can get through the start of the game.');
