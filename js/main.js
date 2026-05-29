/* =========================================================
   Entry point — 載入資料後按序 init 各 module
   ========================================================= */
import { loadData } from './data.js';
import { initProgress } from './progress.js';
import { initTheme } from './theme.js';
import { initInspector, initSearch } from './inspector.js';
import { initDetail } from './detail.js';
import { initTour } from './tour.js';
import { initModals } from './modals.js';
import { initWidgets } from './widgets.js';

async function boot() {
  try {
    await loadData();               // 1. 載入 + validate lesson 資料
  } catch (err) {
    showFatalError(err.message);
    return;
  }
  const steps = [
    ['inspector', initInspector],   // 2. 建 pin（需要 ANNOTATIONS）+ inspect 開關
    ['progress', initProgress],     // 3. 進度（需要 TOUR_ORDER）
    ['theme', initTheme],           // 4. Dark mode
    ['search', initSearch],         // 5. 搜尋 + filter
    ['detail', initDetail],         // 6. Detail panel 事件
    ['tour', initTour],             // 7. Tour nav 事件
    ['modals', initModals],         // 8. Modals + 全域 keydown + 開頁 entry
    ['widgets', initWidgets],       // 9. Toast / cookie / dropdown / faq / scroll / reveal
  ];
  for (const [name, fn] of steps) {
    try { fn(); }
    catch (err) { console.error(`init "${name}" 失敗:`, err); }
  }
}

function showFatalError(msg) {
  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
    'background:#FAF7F2;color:#1A1A2E;font:16px/1.6 system-ui;padding:24px;text-align:center;z-index:9999;';
  el.textContent = msg;
  document.body.appendChild(el);
}

boot();
