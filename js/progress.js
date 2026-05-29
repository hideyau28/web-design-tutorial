/* =========================================================
   學習進度追蹤 — localStorage 記住睇過嘅 lesson + UI 更新
   ========================================================= */
import { state, data, STORAGE_KEY } from './state.js';
import { dom } from './dom.js';

function loadVisited() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.visited = new Set(JSON.parse(raw));
  } catch (e) { /* localStorage 失敗就當未睇 */ }
}

function saveVisited() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.visited]));
  } catch (e) {}
}

export function markVisited(id) {
  if (state.visited.has(id)) return;
  state.visited.add(id);
  saveVisited();
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.classList.add('annotate-visited');
  updateProgressUI();
}

export function updateProgressUI() {
  const total = data.TOUR_ORDER.length;
  if (dom.progressCount) dom.progressCount.textContent = state.visited.size;
  if (dom.progressTotal) dom.progressTotal.textContent = total;
  if (dom.progressFill) dom.progressFill.style.width = `${(state.visited.size / total) * 100}%`;
}

function applyVisitedMarks() {
  dom.annotateEls.forEach(el => {
    if (state.visited.has(el.dataset.id)) el.classList.add('annotate-visited');
  });
}

function resetProgress() {
  if (!confirm('重置學習進度？所有 ✓ 標記會消失。')) return;
  state.visited.clear();
  saveVisited();
  dom.annotateEls.forEach(el => el.classList.remove('annotate-visited'));
  updateProgressUI();
}

export function initProgress() {
  loadVisited();
  applyVisitedMarks();
  updateProgressUI();
  dom.progressReset && dom.progressReset.addEventListener('click', resetProgress);
}
