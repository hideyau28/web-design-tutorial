/* =========================================================
   Inspector — 標註 pin、inspect 開關、hover tooltip 事件、
   搜尋 + 分類 filter
   ========================================================= */
import { state, data, isTouch } from './state.js';
import { dom } from './dom.js';
import { showTooltipFor, hideTooltip, positionTooltipByMouse, positionTooltipNearElement } from './tooltip.js';
import { openDetail } from './detail.js';

/** 設定 inspect 模式開 / 關 */
export function setInspect(on) {
  state.inspectOn = on;
  document.body.classList.toggle('inspect-on', on);
  dom.modeLabel.textContent = on
    ? (isTouch ? '已開啟 — 撳任何方塊' : '已開啟 — Tab / Hover 任何方塊')
    : '已關閉 · 撳開關睇返教學';
  dom.toggle.title = on ? '關閉標註教學' : '開返標註教學';
  dom.toggle.setAttribute('aria-checked', String(on));
  dom.pinEls.forEach(p => { p.tabIndex = on ? 0 : -1; });  // 只 pin 可 keyboard focus
  if (!on) hideTooltip();
}

/** 每個 [data-annotate] 注入一個 pin 掣（避免 nested-interactive WCAG 違規）*/
function buildPins() {
  dom.annotateEls.forEach(el => {
    const d = data.ANNOTATIONS[el.dataset.id];
    if (!d) return;
    el.removeAttribute('role');
    el.removeAttribute('aria-label');

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'annotate-pin';
    pin.dataset.pinFor = el.dataset.id;
    pin.setAttribute('aria-label', `${d.name}（${d.zh}）— 按 Enter 開講解`);
    pin.textContent = 'i';
    el.appendChild(pin);
    dom.pinEls.push(pin);

    pin.addEventListener('click', e => {
      if (!state.inspectOn) return;
      e.stopPropagation();
      openDetail(el.dataset.id, pin);
    });
    pin.addEventListener('focus', () => {
      if (!state.inspectOn) return;
      showTooltipFor(el);
      positionTooltipNearElement(el);
    });
    pin.addEventListener('blur', () => hideTooltip());
  });
}

/** 每個 annotate section 嘅 hover / click 事件 */
function wireAnnotateEvents() {
  dom.annotateEls.forEach(el => {
    el.addEventListener('mouseenter', e => {
      if (!state.inspectOn || e.target.closest('.annotate-pin')) return;
      showTooltipFor(el);
      positionTooltipByMouse(e);
    });
    el.addEventListener('mousemove', e => {
      if (!state.inspectOn) return;
      positionTooltipByMouse(e);
    });
    el.addEventListener('mouseleave', () => hideTooltip());
    // 滑鼠 click section = 開 detail；鍵盤入口由 pin 處理
    el.addEventListener('click', e => {
      if (!state.inspectOn || e.target.closest('.annotate-pin')) return;
      e.stopPropagation();
      openDetail(el.dataset.id, el);
    });
  });
}

export function initInspector() {
  buildPins();
  wireAnnotateEvents();
  document.body.classList.add('inspect-on');
  setInspect(true);

  dom.toggle.addEventListener('click', () => setInspect(!state.inspectOn));
  dom.toggle.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setInspect(!state.inspectOn);
    }
  });
}

/* ---------- 搜尋 + 分類 filter ---------- */
function applyFilter() {
  let visible = 0;
  dom.annotateEls.forEach(el => {
    const d = data.ANNOTATIONS[el.dataset.id];
    if (!d) return;
    const catOk = state.activeCats.has(el.dataset.cat);
    const text = `${d.name} ${d.zh} ${d.plain || ''} ${d.hint || ''}`.toLowerCase();
    const term = state.searchTerm.toLowerCase().trim();
    const searchOk = !term || text.includes(term);
    const matchSearch = !!term && searchOk;
    const hidden = !catOk || !searchOk;
    el.classList.toggle('filter-hidden', hidden);
    el.classList.toggle('filter-match-glow', matchSearch && catOk);
    if (!hidden) visible++;
  });
  // 冇結果 → 喺 inspector 顯示 empty state（唔會似壞咗）
  if (dom.inspectorEmpty) dom.inspectorEmpty.hidden = visible > 0;
}

export function initSearch() {
  dom.annSearch && dom.annSearch.addEventListener('input', e => {
    state.searchTerm = e.target.value;
    applyFilter();
  });
  dom.catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.catFilter;
      const isOn = chip.getAttribute('aria-pressed') === 'true';
      if (isOn) { state.activeCats.delete(cat); chip.setAttribute('aria-pressed', 'false'); }
      else { state.activeCats.add(cat); chip.setAttribute('aria-pressed', 'true'); }
      applyFilter();
    });
  });
  // Empty state 嘅「清除全部」— 重設搜尋 + 全開分類
  dom.inspectorReset && dom.inspectorReset.addEventListener('click', () => {
    state.searchTerm = '';
    if (dom.annSearch) dom.annSearch.value = '';
    state.activeCats = new Set(['structure', 'design', 'tech']);
    dom.catChips.forEach(c => c.setAttribute('aria-pressed', 'true'));
    applyFilter();
    dom.annSearch && dom.annSearch.focus();
  });
}
