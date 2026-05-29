/* =========================================================
   Modals — Intro / Celebration / About / Demo dialog
   + 全域 keydown（Escape、Tour ← →、focus trap）
   ========================================================= */
import { state, data } from './state.js';
import { dom } from './dom.js';
import { copyText, haptic, trapFocusIn } from './util.js';
import { hideTooltip } from './tooltip.js';
import { openDetail, closeDetail, scrollToAnnotation } from './detail.js';
import { startTour, tourPrev, tourNext } from './tour.js';

/* ---------- Intro ---------- */
export function closeIntro() {
  dom.intro.classList.add('hidden');
  dom.intro.setAttribute('aria-hidden', 'true');
  hideTooltip();
  setTimeout(() => dom.toggle.focus(), 50);  // 方便鍵盤用家
}

/* ---------- Celebration ---------- */
export function openCelebrate() {
  state.celebrateOpenedFrom = document.activeElement;
  if (dom.celebrateLead) {
    dom.celebrateLead.textContent =
      `你睇晒 ${data.TOUR_ORDER.length} 個 pattern。對住任何一個 AI 寫出嚟嘅 landing page，你而家識：`;
  }
  dom.celebrate.classList.remove('hidden');
  dom.celebrate.setAttribute('aria-hidden', 'false');
  setTimeout(() => dom.celebrateRestart.focus(), 50);
}

function closeCelebrate() {
  dom.celebrate.classList.add('hidden');
  dom.celebrate.setAttribute('aria-hidden', 'true');
  const from = state.celebrateOpenedFrom;
  if (from && typeof from.focus === 'function') from.focus();
}

/* ---------- About ---------- */
function openAbout() {
  state.aboutOpenedFrom = document.activeElement;
  dom.about.classList.remove('hidden');
  dom.about.setAttribute('aria-hidden', 'false');
  setTimeout(() => dom.aboutClose.focus(), 50);
}

function closeAbout() {
  dom.about.classList.add('hidden');
  dom.about.setAttribute('aria-hidden', 'true');
  const from = state.aboutOpenedFrom;
  if (from && typeof from.focus === 'function') from.focus();
}

/* ---------- Demo Dialog (native <dialog>) ---------- */
function openDemoDialog() {
  const dlg = dom.demoDialog;
  if (!dlg) return;
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}

function closeDemoDialog() {
  const dlg = dom.demoDialog;
  if (!dlg) return;
  if (dlg.open) dlg.close();
  else dlg.removeAttribute('open');
}

/* ---------- Wiring ---------- */
function wireCelebrate() {
  dom.celebrateClose && dom.celebrateClose.addEventListener('click', closeCelebrate);
  dom.celebrateExplore && dom.celebrateExplore.addEventListener('click', closeCelebrate);
  dom.celebrateRestart && dom.celebrateRestart.addEventListener('click', () => {
    closeCelebrate();
    setTimeout(startTour, 100);
  });
  dom.celebrateShare && dom.celebrateShare.addEventListener('click', async () => {
    const url = location.href.split('?')[0];
    const shareData = {
      title: '同 AI 講設計 — 網頁拆解互動教學',
      text: '一個用嚟教你叫 AI 寫網頁時識指、識睇、識叫 AI 改嘅互動 tutorial。',
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); haptic([5, 30, 5]); return; }
      catch (e) { /* user 取消 → fallback */ }
    }
    copyText(url, dom.celebrateShare, '✓ 已複製 URL');
  });
  dom.celebrate && dom.celebrate.addEventListener('click', e => {
    if (e.target === dom.celebrate) closeCelebrate();
  });
}

function wireAbout() {
  dom.introAbout && dom.introAbout.addEventListener('click', openAbout);
  dom.aboutClose && dom.aboutClose.addEventListener('click', closeAbout);
  dom.aboutDone && dom.aboutDone.addEventListener('click', closeAbout);
  dom.about && dom.about.addEventListener('click', e => {
    if (e.target === dom.about) closeAbout();
  });
}

function wireDemo() {
  dom.openDemoBtn && dom.openDemoBtn.addEventListener('click', () => {
    // inspect on 嗰陣 click 會 bubble 落 annotate 開 lesson；inspect off 先開 demo
    if (!state.inspectOn) openDemoDialog();
  });
  dom.demoDialogClose && dom.demoDialogClose.addEventListener('click', closeDemoDialog);
  dom.demoDialog && dom.demoDialog.addEventListener('click', e => {
    if (e.target === dom.demoDialog) closeDemoDialog();
  });
}

function wireGlobalKeydown() {
  document.addEventListener('keydown', e => {
    // Escape — 關優先級最高嗰個
    if (e.key === 'Escape') {
      if (dom.celebrate && !dom.celebrate.classList.contains('hidden')) closeCelebrate();
      else if (dom.about && !dom.about.classList.contains('hidden')) closeAbout();
      else if (dom.detail.classList.contains('open')) closeDetail();
      else if (!dom.intro.classList.contains('hidden')) closeIntro();
      return;
    }
    // Tour 模式 + detail 開：← → 切換
    if (state.tourMode && dom.detail.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        if (e.target.matches('input, textarea')) return;
        e.preventDefault(); tourPrev(); return;
      }
      if (e.key === 'ArrowRight') {
        if (e.target.matches('input, textarea')) return;
        e.preventDefault(); tourNext(); return;
      }
    }
    // Focus trap — celebrate > about > detail > intro
    if (dom.celebrate && !dom.celebrate.classList.contains('hidden')) trapFocusIn(dom.celebrate, e);
    else if (dom.about && !dom.about.classList.contains('hidden')) trapFocusIn(dom.about, e);
    else if (dom.detail.classList.contains('open')) trapFocusIn(dom.detail, e);
    else if (!dom.intro.classList.contains('hidden')) trapFocusIn(dom.intro, e);
  });
}

function wireIntro() {
  dom.introStartTour.addEventListener('click', () => {
    dom.intro.classList.add('hidden');
    dom.intro.setAttribute('aria-hidden', 'true');
    setTimeout(startTour, 250);   // 等 intro fade-out
  });
  dom.introClose.addEventListener('click', closeIntro);
  dom.intro.addEventListener('click', e => {
    if (e.target === dom.intro) closeIntro();
  });
  // 滑鼠離開 viewport 收 tooltip
  document.addEventListener('mouseleave', hideTooltip);
  window.addEventListener('blur', hideTooltip);
}

/** 開頁：?lesson=xxx 直接跳去；否則 focus primary CTA */
function initEntry() {
  const lessonParam = new URLSearchParams(location.search).get('lesson');
  if (lessonParam && data.ANNOTATIONS[lessonParam]) {
    dom.intro.classList.add('hidden');
    dom.intro.setAttribute('aria-hidden', 'true');
    const el = document.querySelector(`[data-id="${lessonParam}"]`);
    setTimeout(() => { scrollToAnnotation(el); openDetail(lessonParam, el); }, 200);
  } else {
    setTimeout(() => dom.introStartTour.focus(), 100);
  }
}

export function initModals() {
  wireIntro();
  wireCelebrate();
  wireAbout();
  wireDemo();
  wireGlobalKeydown();
  initEntry();
}
