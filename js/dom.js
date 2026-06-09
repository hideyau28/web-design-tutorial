/* =========================================================
   DOM 元素參照 — module 預設 deferred，執行時 HTML 已 parse 完，
   所以喺呢度直接 query 係安全嘅。
   ========================================================= */

const $ = (id) => document.getElementById(id);

export const dom = {
  // Tooltip + Detail
  tip: $('annTip'),
  detail: $('detail'),
  detailClose: $('detailClose'),
  detailNav: $('detailNav'),
  detailPrev: $('detailPrev'),
  detailNext: $('detailNext'),
  detailProgress: $('detailProgress'),
  tourLive: $('tourLive'),

  // Inspector
  toggle: $('toggle'),
  modeLabel: $('modeLabel'),
  annSearch: $('annSearch'),
  themeToggle: $('themeToggle'),
  progressCount: $('progressCount'),
  progressTotal: $('progressTotal'),
  progressFill: $('progressFill'),
  progressReset: $('progressReset'),
  inspectorEmpty: $('inspectorEmpty'),
  inspectorReset: $('inspectorReset'),

  // Intro
  intro: $('intro'),
  introClose: $('introClose'),
  introStartTour: $('introStartTour'),
  introAbout: $('introAbout'),

  // Celebrate
  celebrate: $('celebrate'),
  celebrateClose: $('celebrateClose'),
  celebrateRestart: $('celebrateRestart'),
  celebrateExplore: $('celebrateExplore'),
  celebrateShare: $('celebrateShare'),
  celebrateLead: $('celebrateLead'),

  // About
  about: $('about'),
  aboutClose: $('aboutClose'),
  aboutDone: $('aboutDone'),

  // Demo dialog
  demoDialog: $('demoDialog'),
  demoDialogClose: $('demoDialogClose'),
  openDemoBtn: $('openDemoDialog'),

  // Widgets
  toast: $('toast'),
  toastClose: $('toastClose'),
  cookieBanner: $('cookieBanner'),
  cookieAccept: $('cookieAccept'),
  cookieReject: $('cookieReject'),
  dropdown: document.querySelector('.nav-dropdown'),
  dropdownTrigger: $('dropdownTrigger'),
  dropdownPanel: $('dropdownPanel'),
  navEl: $('nav'),
  scrollProgressFill: $('scrollProgressFill'),
  hireBadge: $('hireBadge'),
  hireBadgeClose: $('hireBadgeClose'),

  // Collections
  annotateEls: Array.from(document.querySelectorAll('[data-annotate]')),
  catChips: Array.from(document.querySelectorAll('[data-cat-filter]')),
  pinEls: [],
};
