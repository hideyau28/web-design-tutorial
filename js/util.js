/* =========================================================
   共用工具：clipboard、haptic、View Transitions、focus trap
   ========================================================= */

/** 複製文字到 clipboard，按掣畀視覺反饋 */
export function copyText(text, btn, feedback = '✓ 已抄') {
  const done = () => {
    const orig = btn.textContent;
    btn.textContent = feedback;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); }
  catch (e) { /* swallow */ }
  document.body.removeChild(ta);
}

/** Haptic feedback — 跟 prefers-reduced-motion 自動 disable */
export function haptic(pattern) {
  if (!navigator.vibrate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  navigator.vibrate(pattern);
}

/** View Transitions API helper — reduced-motion / 不支援時同步 fallback */
export function withViewTransition(fn) {
  if (!document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fn();
    return;
  }
  document.startViewTransition(fn);
}

/** 攞 container 入面所有可 focus 嘅元素 */
export function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => el.offsetParent !== null);
}

/** Modal focus trap — Tab / Shift+Tab 喺 container 內循環 */
export function trapFocusIn(container, e) {
  if (e.key !== 'Tab') return;
  const focusables = getFocusable(container);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

/* =========================================================
   背景 inert 管理 — modal 打開時將其餘 <body> 子元素設 inert，
   令鍵盤 + screen reader（virtual cursor）+ pointer 都去唔到後面內容。
   配合 focus trap 做雙重保障，亦兌現 aria-modal="true" 嘅承諾。
   ========================================================= */
const modalStack = [];

function refreshInert() {
  const top = modalStack[modalStack.length - 1] || null;
  Array.from(document.body.children).forEach(child => {
    const tag = child.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') return;
    if (child.classList.contains('skip-link') ||
        child.id === 'tourLive' ||
        child.classList.contains('scroll-progress')) return;
    child.inert = top ? child !== top : false;
  });
}

/** Modal 打開：推上 stack，其餘背景設 inert */
export function pushModal(el) {
  if (!el) return;
  const i = modalStack.indexOf(el);
  if (i >= 0) modalStack.splice(i, 1);
  modalStack.push(el);
  refreshInert();
}

/** Modal 關閉：由 stack 移走，回復背景（仲有其他 modal 開住就 inert 返佢哋）*/
export function popModal(el) {
  const i = modalStack.indexOf(el);
  if (i >= 0) modalStack.splice(i, 1);
  refreshInert();
}
