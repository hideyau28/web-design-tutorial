/* =========================================================
   Tooltip — hover / focus 嗰陣彈出嘅即時講解卡
   ========================================================= */
import { state, data, isTouch, CAT_LABEL } from './state.js';
import { dom } from './dom.js';

export function showTooltipFor(el) {
  // Tour 進行中 / detail panel 開住，唔好彈 tooltip 阻住（減少 overlay 雜亂）
  if (state.tourMode || dom.detail.classList.contains('open')) return;
  const d = data.ANNOTATIONS[el.dataset.id];
  if (!d) return;
  const tip = dom.tip;
  tip.dataset.cat = d.cat;
  tip.querySelector('.ann-cat').textContent = CAT_LABEL[d.cat];
  tip.querySelector('.ann-name').textContent = d.name;
  tip.querySelector('.ann-zh').textContent = d.zh;
  tip.querySelector('.ann-hint').textContent =
    (d.plain || d.hint) + ' · ' + (isTouch ? '撳' : '按 Enter / Click') + ' 睇詳細';
  tip.classList.add('visible');
  tip.setAttribute('aria-hidden', 'false');
}

export function hideTooltip() {
  dom.tip.classList.remove('visible');
  dom.tip.setAttribute('aria-hidden', 'true');
}

export function positionTooltipByMouse(e) {
  const tip = dom.tip;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = e.clientX + 16, y = e.clientY + 16;
  if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
  if (y + h > window.innerHeight - 8) y = e.clientY - h - 16;
  tip.style.left = Math.max(8, x) + 'px';
  tip.style.top = Math.max(8, y) + 'px';
}

export function positionTooltipNearElement(el) {
  const tip = dom.tip;
  const rect = el.getBoundingClientRect();
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = rect.left;
  let y = rect.bottom + 12;
  if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8;
  if (y + h > window.innerHeight - 8) y = rect.top - h - 12;
  tip.style.left = Math.max(8, x) + 'px';
  tip.style.top = Math.max(8, y) + 'px';
}
