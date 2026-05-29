/* =========================================================
   Dark mode — localStorage > prefers-color-scheme，可手動 toggle
   ========================================================= */
import { THEME_KEY } from './state.js';
import { dom } from './dom.js';

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  if (dom.themeToggle) {
    dom.themeToggle.setAttribute('aria-label', theme === 'dark' ? '切換至淺色主題' : '切換至深色主題');
  }
}

export function initTheme() {
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  dom.themeToggle && dom.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}
