// The page layout. Same structure and class names as Carrot Patch, so the kit styles it the same way.
import { ICON } from '../../kit/js/ui.js';
export { ICON };

export const MARKUP = `
<div class="app home-mode" id="app">
  <header class="top">
    <div class="title-row"><h1 class="k-title">Rain <span>Barrel</span></h1><span class="dev-badge" id="devBadge" hidden>Test mode</span></div>
    <div class="stats">
      <div class="chip" id="waterChip" title="Water"><i class="dot d-water"></i><span id="water">0</span><small id="waterLbl">water</small></div>
      <div class="chip" id="tapsChip" title="Taps"><i class="dot d-tap"></i><span id="taps">0</span><small id="tapsLbl">taps</small></div>
      <div class="chip" title="Plants watered"><i class="dot d-plant"></i><span id="plants">0</span><small>plants</small></div>
    </div>
  </header>

  <main class="home" id="home" hidden></main>

  <div class="controls">
    <button class="btn main" id="hint">Hint</button>
    <button class="btn ghost" id="undo">Undo</button>
    <button class="btn ghost icon" id="restart" aria-label="Restart level" title="Restart level">${ICON.restart}<span class="lbl"></span></button>
    <button class="btn ghost icon" id="sound" aria-label="Sound" title="Sound">${ICON.soundAll}</button>
    <button class="btn ghost icon" id="map" aria-label="Gardens" title="Gardens">${ICON.map}</button>
  </div>

  <div class="board" id="board">
    <canvas id="cv" aria-label="Garden board"></canvas>
    <div class="over" id="over" hidden></div>
  </div>

  <div class="msg-row">
    <p class="msg" id="msg" aria-live="polite"></p>
    <button class="btn ghost small dev-solve" id="devSkip" hidden>Solve ★★★</button>
  </div>
</div>`;
