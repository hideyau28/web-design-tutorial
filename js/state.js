/* =========================================================
   Shared state — 全部 mutable state 經呢個物件，避開 ES module
   live-binding 陷阱。Constants 直接 export。
   ========================================================= */

export const state = {
  inspectOn: true,
  tourMode: false,        // 係咪 Guided Tour 中
  tourIndex: 0,           // tour 進度
  visited: new Set(),     // 已睇過嘅 annotation IDs
  searchTerm: '',
  openedFrom: null,       // 觸發 detail panel 嘅 element
  celebrateOpenedFrom: null,
  aboutOpenedFrom: null,
  activeCats: new Set(['structure', 'design', 'tech']),
  toastDismissTimer: null,
};

// 資料（由 data.js async 載入後填）— 用物件 property，所有 module 讀 data.ANNOTATIONS
export const data = {
  ANNOTATIONS: {},
  TOUR_ORDER: [],
};

export const isTouch = window.matchMedia('(hover: none)').matches;

export const CAT_LABEL = {
  structure: 'Structure · 結構',
  design:    'Design · 設計原則',
  tech:      'Technique · 技術',
};

export const STORAGE_KEY = 'wdt.visited';
export const THEME_KEY = 'wdt.theme';
export const COOKIE_KEY = 'wdt.cookie';
