/* =========================================================
   Guided Tour — 順序行 24 站，← → 切換，完成觸發 celebration
   ========================================================= */
import { state, data } from './state.js';
import { dom } from './dom.js';
import { haptic, withViewTransition } from './util.js';
import { openDetail, closeDetail } from './detail.js';
import { openCelebrate } from './modals.js';

export function updateTourNav() {
  const total = data.TOUR_ORDER.length;
  dom.detailProgress.textContent = `${state.tourIndex + 1} / ${total}`;
  dom.detailPrev.disabled = state.tourIndex === 0;
  dom.detailNext.textContent = state.tourIndex === total - 1 ? '完成 ✓ 結束' : '下一個 →';
  // 廣播畀 screen reader（aria-live polite）
  const d = data.ANNOTATIONS[data.TOUR_ORDER[state.tourIndex]];
  if (dom.tourLive && d) {
    dom.tourLive.textContent = `第 ${state.tourIndex + 1} 個，共 ${total} 個：${d.name}（${d.zh}）`;
  }
}

export function startTour() {
  state.tourMode = true;
  state.tourIndex = 0;
  const id = data.TOUR_ORDER[state.tourIndex];
  const el = document.querySelector(`[data-id="${id}"]`);
  openDetail(id, el);          // openDetail 自己會 scroll
}

export function tourPrev() {
  if (state.tourIndex <= 0) return;
  withViewTransition(() => {
    state.tourIndex--;
    const id = data.TOUR_ORDER[state.tourIndex];
    openDetail(id, document.querySelector(`[data-id="${id}"]`));
    haptic(10);
  });
}

export function tourNext() {
  if (state.tourIndex >= data.TOUR_ORDER.length - 1) {
    closeDetail();
    openCelebrate();
    haptic([10, 40, 30]);
    return;
  }
  withViewTransition(() => {
    state.tourIndex++;
    const id = data.TOUR_ORDER[state.tourIndex];
    openDetail(id, document.querySelector(`[data-id="${id}"]`));
    haptic(10);
  });
}

export function initTour() {
  dom.detailPrev.addEventListener('click', tourPrev);
  dom.detailNext.addEventListener('click', tourNext);
}
