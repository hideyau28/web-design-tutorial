/* =========================================================
   產品頁本身嘅組件：Toast、Cookie banner、Nav dropdown、
   FAQ accordion、scroll nav state + progress bar、reveal observer
   ========================================================= */
import { state, COOKIE_KEY } from './state.js';
import { dom } from './dom.js';

/* ---------- Toast ---------- */
function showToast() {
  const toast = dom.toast;
  if (!toast) return;
  toast.removeAttribute('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(state.toastDismissTimer);
  state.toastDismissTimer = setTimeout(hideToast, 6000);
}

function hideToast() {
  const toast = dom.toast;
  if (!toast) return;
  toast.classList.remove('show');
  clearTimeout(state.toastDismissTimer);
  setTimeout(() => toast.setAttribute('hidden', ''), 400);
}

function initToast() {
  dom.toastClose?.addEventListener('click', hideToast);
  // 等 intro 關 + 唔喺 Tour / detail 開住先彈（避免 overlay 撞）
  const idle = () => dom.intro.classList.contains('hidden') &&
                     !state.tourMode && !dom.detail.classList.contains('open');
  setTimeout(() => {
    if (idle()) { showToast(); return; }
    let waited = 0;
    const wait = setInterval(() => {
      waited += 500;
      if (idle()) { showToast(); clearInterval(wait); }
      else if (waited > 30000) clearInterval(wait);
    }, 500);
  }, 3000);
}

/* ---------- Cookie Banner ---------- */
function dismissCookie(choice) {
  try { localStorage.setItem(COOKIE_KEY, choice); } catch (e) {}
  dom.cookieBanner?.classList.add('dismissed');
  setTimeout(() => dom.cookieBanner?.remove(), 400);
}

function initCookie() {
  const banner = dom.cookieBanner;
  if (!banner) return;
  let stored = null;
  try { stored = localStorage.getItem(COOKIE_KEY); } catch (e) {}
  if (stored) { banner.remove(); return; }

  dom.cookieAccept?.addEventListener('click', () => dismissCookie('accept'));
  dom.cookieReject?.addEventListener('click', () => dismissCookie('reject'));

  // Footer 入 view 嗰陣 fade 走 banner（避免 overlap）
  const footerEl = document.querySelector('.footer');
  if (footerEl && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => banner.classList.toggle('fade-near-footer', e.isIntersecting));
    }, { threshold: 0.05 });
    obs.observe(footerEl);
  }
}

/* ---------- Nav Dropdown ---------- */
function setDropdownOpen(open) {
  const { dropdown, dropdownTrigger, dropdownPanel } = dom;
  if (!dropdown) return;
  dropdown.dataset.open = String(open);
  dropdownTrigger?.setAttribute('aria-expanded', String(open));
  if (dropdownPanel) {
    if (open) dropdownPanel.removeAttribute('hidden');
    else dropdownPanel.setAttribute('hidden', '');
  }
}

function initDropdown() {
  const { dropdown, dropdownTrigger, dropdownPanel } = dom;
  if (!(dropdown && dropdownTrigger && dropdownPanel)) return;
  dropdown.addEventListener('mouseenter', () => setDropdownOpen(true));
  dropdown.addEventListener('mouseleave', () => setDropdownOpen(false));
  dropdownTrigger.addEventListener('click', e => {
    if (state.inspectOn) return;   // inspect mode 下交畀 annotate click
    e.stopPropagation();
    setDropdownOpen(dropdown.dataset.open !== 'true');
  });
  dropdown.addEventListener('keydown', e => {
    if (e.key === 'Escape') { setDropdownOpen(false); dropdownTrigger.focus(); }
  });
  document.addEventListener('click', e => {
    if (dropdown.dataset.open !== 'true') return;
    if (!dropdown.contains(e.target)) setDropdownOpen(false);
  });
}

/* ---------- FAQ accordion ---------- */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(isOpen));
      a.style.maxHeight = isOpen ? a.scrollHeight + 'px' : '0px';
    });
  });
}

/* ---------- Scroll nav state + progress bar ---------- */
function initScroll() {
  const update = () => {
    const y = window.scrollY;
    dom.navEl.classList.toggle('scrolled', y > 20);
    if (dom.scrollProgressFill) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      dom.scrollProgressFill.style.width = Math.min(100, (y / max) * 100) + '%';
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(ent => {
      if (ent.isIntersecting) { ent.target.classList.add('in'); io.unobserve(ent.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

export function initWidgets() {
  initToast();
  initCookie();
  initDropdown();
  initFaq();
  initScroll();
  initReveal();
}
