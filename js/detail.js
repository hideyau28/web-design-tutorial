/* =========================================================
   Detail Panel — 點開 lesson 之後嗰個側邊（手機 bottom sheet）
   render plain / checklist / quickFix / before-after / deep
   ========================================================= */
import { state, data, CAT_LABEL } from './state.js';
import { dom } from './dom.js';
import { copyText, pushModal, popModal } from './util.js';
import { hideTooltip } from './tooltip.js';
import { showToast } from './widgets.js';
import { markVisited } from './progress.js';
import { updateTourNav } from './tour.js';

function renderChecklist(items) {
  const wrap = dom.detail.querySelector('#dChecklist');
  wrap.innerHTML = '';
  (items || []).forEach(item => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'checklist-toggle';
    btn.setAttribute('role', 'checkbox');
    btn.setAttribute('aria-checked', 'false');
    btn.textContent = item;
    btn.addEventListener('click', () => toggleCheck(btn));
    btn.addEventListener('keydown', e => {
      if (e.key === ' ') { e.preventDefault(); toggleCheck(btn); }
    });
    li.appendChild(btn);
    wrap.appendChild(li);
  });
}

function renderQuickFix(items) {
  const wrap = dom.detail.querySelector('#dQuickFix');
  wrap.innerHTML = '';
  (items || []).forEach(qf => {
    const item = document.createElement('div');
    item.className = 'quickfix-item';

    const p = document.createElement('div');
    p.className = 'quickfix-problem';
    p.textContent = qf.problem;

    const say = document.createElement('div');
    say.className = 'quickfix-say';
    say.textContent = qf.say;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'quickfix-copy';
    copyBtn.textContent = '抄';
    copyBtn.setAttribute('aria-label', '抄低呢句畀 AI');
    copyBtn.addEventListener('click', () => copyText(qf.say, copyBtn));
    say.appendChild(copyBtn);

    item.appendChild(p);
    item.appendChild(say);
    wrap.appendChild(item);
  });
}

function renderBeforeAfter(ba) {
  const baWrap = dom.detail.querySelector('#dBeforeAfterWrap');
  const badList = dom.detail.querySelector('#dBaBad');
  const goodList = dom.detail.querySelector('#dBaGood');
  badList.innerHTML = '';
  goodList.innerHTML = '';
  if (ba && ba.bad && ba.good) {
    baWrap.style.display = '';
    ba.bad.forEach(b => { const li = document.createElement('li'); li.textContent = b; badList.appendChild(li); });
    ba.good.forEach(g => { const li = document.createElement('li'); li.textContent = g; goodList.appendChild(li); });
  } else {
    baWrap.style.display = 'none';
  }
}

function renderList(selector, items) {
  const ul = dom.detail.querySelector(selector);
  ul.innerHTML = '';
  (items || []).forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
}

export function openDetail(id, triggerEl) {
  const d = data.ANNOTATIONS[id];
  if (!d) return;
  const detail = dom.detail;
  detail.dataset.cat = d.cat;
  detail.querySelector('.detail-cat').textContent = CAT_LABEL[d.cat];
  detail.querySelector('.detail-name').textContent = d.name;
  detail.querySelector('.detail-zh').textContent = d.zh;
  detail.querySelector('#dPlain').textContent = d.plain || d.hint || '';

  renderChecklist(d.checklist);
  renderQuickFix(d.quickFix);
  renderBeforeAfter(d.beforeAfter);

  // Deep section
  detail.querySelector('#dPurpose').textContent = d.purpose;
  renderList('#dDesign', d.design);
  renderList('#dTech', d.tech);

  const codeWrap = detail.querySelector('#dCodeWrap');
  if (d.code) {
    codeWrap.style.display = '';
    detail.querySelector('#dCode').innerHTML = d.code;
  } else {
    codeWrap.style.display = 'none';
  }

  state.openedFrom = triggerEl || document.activeElement;
  detail.classList.add('open');
  detail.setAttribute('aria-hidden', 'false');
  pushModal(detail);              // 背景 inert（鍵盤 + SR 都去唔到後面）
  detail.scrollTop = 0;
  hideTooltip();
  setActiveHighlight(id);
  markVisited(id);

  // Tour: toast / modal / cookie 嘅元素平時未必喺畫面 — 補返 anchor 體驗，唔好開咗 panel 但畫面冇嘢
  const targetEl = document.querySelector(`[data-annotate][data-id="${id}"]`);
  const note = detail.querySelector('#dAnchorNote');
  if (id === 'toast') showToast();   // 令 toast 真係彈出嚟示範
  if (note) {
    if (id === 'modal') {
      note.hidden = false;
      note.textContent = '👉 撳 Hero 區嘅「▶ 睇 2 分鐘 demo」掣，就會見到呢個 native <dialog> 彈出。';
    } else if (id === 'cookie' && !document.getElementById('cookieBanner')) {
      note.hidden = false;
      note.textContent = '👉 你已經撳走咗 cookie banner — 佢通常喺頁面最底彈出。';
    } else {
      note.hidden = true;
      note.textContent = '';
    }
  }
  if (targetEl) setTimeout(() => scrollToAnnotation(targetEl), 150);
  updateUrlForLesson(id);

  // Tour 模式：顯示 nav + sync tourIndex
  if (state.tourMode) {
    const idx = data.TOUR_ORDER.indexOf(id);
    if (idx >= 0) state.tourIndex = idx;
    updateTourNav();
    dom.detailNav.hidden = false;
  } else {
    dom.detailNav.hidden = true;
  }

  // Tour 模式：focus 落 panel 容器（有 aria-labelledby），等 screen reader 由 lesson 名 + 內容讀起，
  // 唔好每跳一站都搶 focus 去關閉掣搞到要重新 Tab 入內容
  setTimeout(() => { (state.tourMode ? detail : dom.detailClose).focus(); }, 50);
}

export function closeDetail() {
  const detail = dom.detail;
  if (!detail.classList.contains('open')) return;
  detail.classList.remove('open');
  detail.setAttribute('aria-hidden', 'true');
  popModal(detail);                // 解除背景 inert（要喺 focus 還原之前）
  state.tourMode = false;          // 關 detail = 退出 tour
  dom.detailNav.hidden = true;
  clearActiveHighlight();
  if (location.search) history.replaceState(null, '', location.pathname);
  if (state.openedFrom && typeof state.openedFrom.focus === 'function') {
    state.openedFrom.focus();
  }
  state.openedFrom = null;
}

function toggleCheck(btn) {
  const isChecked = btn.classList.toggle('checked');
  btn.setAttribute('aria-checked', String(isChecked));
  btn.parentElement.classList.toggle('checked', isChecked);
}

/* ---------- Active element highlight (pulse) ---------- */
export function setActiveHighlight(id) {
  clearActiveHighlight();
  const el = document.querySelector(`[data-annotate][data-id="${id}"]`);
  if (el) el.classList.add('annotate-active');
}

export function clearActiveHighlight() {
  document.querySelectorAll('[data-annotate].annotate-active')
    .forEach(el => el.classList.remove('annotate-active'));
}

function updateUrlForLesson(id) {
  const u = new URL(location.href);
  u.searchParams.set('lesson', id);
  history.replaceState(null, '', u);
}

/** Scroll element 入可見區 — 手機同 desktop 唔同策略 */
export function scrollToAnnotation(el) {
  if (!el) return;
  const isMobile = window.matchMedia('(max-width: 880px)').matches;
  if (isMobile) {
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - 16;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ---------- Mobile: swipe-down 關 detail panel ---------- */
function initSwipeDown() {
  const detail = dom.detail;
  let startY = null, currentY = null, dragging = false;
  const THRESHOLD = 80;
  const isMobileSheet = () => window.matchMedia('(max-width: 880px)').matches;

  detail.addEventListener('touchstart', e => {
    if (!isMobileSheet() || !detail.classList.contains('open')) return;
    // 由頂部 drag handle 區（44px）起步就一定接受拖動；否則要 scroll 到頂先 swipe 關
    const fromHandle = (e.touches[0].clientY - detail.getBoundingClientRect().top) < 44;
    if (detail.scrollTop > 0 && !fromHandle) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    dragging = true;
    detail.style.transition = 'none';
  }, { passive: true });

  detail.addEventListener('touchmove', e => {
    if (!dragging) return;
    currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - startY);
    detail.style.transform = `translateY(${delta}px)`;
  }, { passive: true });

  detail.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    detail.style.transition = '';
    const delta = (currentY || 0) - (startY || 0);
    detail.style.transform = '';
    if (delta > THRESHOLD) closeDetail();
    startY = null; currentY = null;
  });
}

export function initDetail() {
  dom.detailClose.addEventListener('click', closeDetail);
  // Backdrop click 關 detail（撳 panel 外、又唔係 annotate）
  document.addEventListener('click', e => {
    if (!dom.detail.classList.contains('open')) return;
    if (dom.detail.contains(e.target)) return;
    if (e.target.closest('[data-annotate]')) return;
    closeDetail();
  });
  initSwipeDown();
}
