/* =========================================================
   build-static.mjs — 由 data/annotations.json 生成兩樣嘢，
   注入 index.html 嘅 marker 之間：
   1. 一個畀 crawler / AI / no-JS 讀嘅靜態「文字速查」section
   2. 一個 ItemList JSON-LD（列晒 24 課）
   改完 annotations.json 之後跑：  node scripts/build-static.mjs
   ========================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANN_PATH = join(ROOT, 'data', 'annotations.json');
const HTML_PATH = join(ROOT, 'index.html');
const BASE = 'https://web-design-tutorial.vercel.app/';

// 同 js/data.js 嘅 TOUR_ORDER 一致（視覺由上至下）
const ORDER = [
  'announce', 'nav', 'dropdown', 'hero', 'eyebrow', 'herocta', 'socialproof', 'herovisual',
  'tooltip', 'modal', 'trust', 'featuregrid', 'featurecard', 'zigzag', 'ringtimer',
  'bento', 'steps', 'testimonial', 'pricing', 'faq', 'finalcta', 'footer',
  'toast', 'cookie',
];

const ann = JSON.parse(readFileSync(ANN_PATH, 'utf8'));
const ids = ORDER.filter((id) => ann[id]);

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ---------- 1. 靜態 HTML section ---------- */
function articleFor(id) {
  const d = ann[id];
  const checklist = (d.checklist || []).map((c) => `        <li>${esc(c)}</li>`).join('\n');
  const quickfix = (d.quickFix || [])
    .map((qf) => `        <dt>${esc(qf.problem)}</dt>\n        <dd>${esc(qf.say)}</dd>`).join('\n');
  const bad = (d.beforeAfter?.bad || []).map((x) => `          <li>${esc(x)}</li>`).join('\n');
  const good = (d.beforeAfter?.good || []).map((x) => `          <li>${esc(x)}</li>`).join('\n');

  let html = `    <article class="lesson-ref" id="lesson-${esc(id)}">
      <h3>${esc(d.name)} · ${esc(d.zh)}</h3>
      <p class="lesson-ref-plain">${esc(d.plain || d.hint || '')}</p>
      <h4>對住 screenshot 點 check</h4>
      <ul>
${checklist}
      </ul>`;
  if (quickfix) {
    html += `
      <h4>想叫 AI 改？抄呢句</h4>
      <dl class="lesson-ref-fix">
${quickfix}
      </dl>`;
  }
  if (bad || good) {
    html += `
      <h4>差版 vs 好版</h4>
      <div class="lesson-ref-ba">
        <div><strong>差版</strong><ul>
${bad}
        </ul></div>
        <div><strong>好版</strong><ul>
${good}
        </ul></div>
      </div>`;
  }
  html += `
    </article>`;
  return html;
}

const section = `
<section class="lessons-ref" id="all-lessons" aria-labelledby="lessonsRefTitle">
  <div class="container">
    <h2 id="lessonsRefTitle">全部 ${ids.length} 個 web design pattern · 文字速查</h2>
    <p class="lessons-ref-intro">上面互動教學嘅文字版 — 每個 pattern 嘅白話解釋、4 點檢查清單、同抄畀 AI 嘅 prompt。方便 Ctrl / ⌘ + F 搜尋，亦等搜尋引擎同 AI 助手讀得到呢啲內容。</p>
${ids.map(articleFor).join('\n')}
  </div>
</section>`;

/* ---------- 2. ItemList JSON-LD ---------- */
const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${ids.length} 個 web design pattern`,
  numberOfItems: ids.length,
  itemListElement: ids.map((id, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${ann[id].name}（${ann[id].zh}）`,
    description: ann[id].plain || ann[id].hint || '',
    url: `${BASE}#lesson-${id}`,
  })),
};
// < 防止任何 < 提早收 </script>
const jsonld = `<script type="application/ld+json">\n${JSON.stringify(itemList, null, 2).replace(/</g, '\\u003c')}\n</script>`;

/* ---------- inject between markers ---------- */
function replaceBetween(html, startMark, endMark, inner) {
  const s = html.indexOf(startMark);
  const e = html.indexOf(endMark);
  if (s < 0 || e < 0) throw new Error(`Markers 搵唔到: ${startMark}`);
  return html.slice(0, s + startMark.length) + '\n' + inner + '\n' + html.slice(e);
}

let html = readFileSync(HTML_PATH, 'utf8');
html = replaceBetween(
  html,
  '<!-- ALL-LESSONS:START — 由 scripts/build-static.mjs 生成，唔好手改 -->',
  '<!-- ALL-LESSONS:END -->',
  section,
);
html = replaceBetween(
  html,
  '<!-- LESSONS-JSONLD:START -->',
  '<!-- LESSONS-JSONLD:END -->',
  jsonld,
);
writeFileSync(HTML_PATH, html);
console.log(`✓ 生成 ${ids.length} 課靜態 HTML + ItemList JSON-LD，已注入 index.html`);
