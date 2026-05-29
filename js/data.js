/* =========================================================
   資料載入 — fetch annotations.json + 基本 validation
   ========================================================= */
import { data } from './state.js';

const REQUIRED_FIELDS = ['cat', 'name', 'zh', 'plain', 'checklist', 'quickFix'];
const VALID_CATS = ['structure', 'design', 'tech'];

// Tour 順序 — 跟視覺由上至下
const TOUR_ORDER = [
  'announce', 'nav', 'dropdown', 'hero', 'eyebrow', 'herocta', 'socialproof', 'herovisual',
  'tooltip', 'modal', 'trust', 'featuregrid', 'featurecard', 'zigzag', 'ringtimer',
  'bento', 'steps', 'testimonial', 'pricing', 'faq', 'finalcta', 'footer',
  'toast', 'cookie',
];

/** 載入 + 驗證 lesson 資料；失敗時 throw 清楚 error */
export async function loadData() {
  let json;
  try {
    const res = await fetch('data/annotations.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = await res.json();
  } catch (err) {
    console.error('載入 annotations.json 失敗:', err);
    throw new Error('無法載入教學內容，請刷新頁面再試。');
  }

  validate(json);
  data.ANNOTATIONS = json;
  data.TOUR_ORDER = TOUR_ORDER.filter(id => json[id]); // 只保留有資料嘅
}

function validate(json) {
  if (!json || typeof json !== 'object') {
    throw new Error('annotations.json 格式錯誤');
  }
  for (const [id, lesson] of Object.entries(json)) {
    for (const field of REQUIRED_FIELDS) {
      if (lesson[field] == null) {
        console.warn(`Lesson "${id}" 缺少欄位: ${field}`);
      }
    }
    if (!VALID_CATS.includes(lesson.cat)) {
      console.warn(`Lesson "${id}" cat 值唔正確: ${lesson.cat}`);
    }
  }
}
