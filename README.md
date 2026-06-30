# 同 AI 講設計 — 網頁拆解互動教學

> 你叫 AI 寫網頁，但唔知點判斷寫得好唔好、唔知點同佢講要改咩？

呢個係一個 **粵語互動教學**，用一個假 SaaS landing page（**Lumo**）做例子，拆解 24 個常見 web design pattern。對住每個元素，教你三樣嘢：

- **識指** — 呢個叫咩名（Hero、CTA、Social Proof⋯⋯），你 cap 圖時識同 AI 講「呢個 Hero⋯⋯」
- **識睇** — 對住 screenshot 用 4 點 checklist 即時 check 寫得好唔好
- **識叫 AI 改** — 常見問題對應抄返畀 AI 嘅短句

## Demo

🔗 **線上版：https://web.flowstudiohk.com**

本地睇：直接 double-click `index.html`，或者用 dev server：

```bash
python3 -m http.server 8000
# 或者
npx serve .
```

之後揀「跟住 Tour 行一次」（由頭到尾 1/24 → 24/24）或者「自由探索」。

> Push 去 `main` branch 會自動部署到 Vercel。

### Deep link

可以直接連去某一課：

```
https://your-domain/?lesson=hero
https://your-domain/?lesson=herocta
https://your-domain/?lesson=pricing
```

合法 `lesson` 值（同 `data-id` 一樣，共 24 個）：`announce`、`nav`、`dropdown`、`hero`、`eyebrow`、`herocta`、`socialproof`、`herovisual`、`tooltip`、`modal`、`trust`、`featuregrid`、`featurecard`、`zigzag`、`ringtimer`、`bento`、`steps`、`testimonial`、`pricing`、`faq`、`finalcta`、`footer`、`toast`、`cookie`。

## 點解寫呢個

而家好多人用 AI 寫網頁（v0、Lovable、Claude、Cursor⋯⋯），但出嚟嘅嘢自己睇唔出好壞、唔識指住改。呢個 tutorial 想填呢個 gap — **唔係教你寫 code，而係教你識指、識睇、識叫 AI 改**。

## 檔案結構

```
web-design-tutorial/
├── index.html              # Page markup + 每個 section 嘅 data-annotate / data-id / data-cat
├── data/
│   └── annotations.json    # 24 個 lesson 嘅內容（非開發者都改得）
├── css/                    # 樣式拆做 7 個 module（按頁面區域，cascade 順序載入）
│   ├── 01-tokens.css       #   @property、design tokens、dark theme、reset、a11y media
│   ├── 02-layout.css       #   announce / nav / buttons / hero / trust / features / zigzag
│   ├── 03-sections.css     #   bento / steps / testimonial / pricing / faq / cta / footer
│   ├── 04-annotations.css  #   標註 overlay：pin / tooltip / inspector
│   ├── 05-panels.css       #   detail panel / intro / tooltip popover / toast / cookie
│   ├── 06-dialogs.css      #   demo dialog / celebration / about
│   └── 07-responsive.css   #   touch + responsive
├── js/                     # ES modules（每個 < 250 行，單一職責）
│   ├── main.js             #   entry：load data → 按序 init
│   ├── state.js / dom.js   #   shared state 物件 + DOM 參照
│   ├── data.js             #   fetch + validate annotations.json
│   ├── util.js             #   clipboard / haptic / view-transition / focus-trap
│   ├── tooltip.js          #   hover 講解卡
│   ├── detail.js           #   detail panel render + active highlight + swipe
│   ├── tour.js             #   guided tour
│   ├── progress.js         #   進度 localStorage
│   ├── theme.js            #   dark mode
│   ├── inspector.js        #   pin / inspect 開關 / 搜尋 + filter
│   ├── modals.js           #   intro / celebrate / about / demo + 全域 keydown
│   └── widgets.js          #   toast / cookie / dropdown / faq / scroll / reveal
├── tests/                  # Playwright e2e（desktop + mobile）
│   ├── flow.spec.js        #   intro / tour / explore / search / dark / deep-link / progress
│   ├── a11y.spec.js        #   axe-core WCAG 2.1 AA（light + dark）
│   └── helpers.js
├── manifest.json           # PWA
├── sitemap.xml / robots.txt
├── og-image.png / icon-*.png
└── README.md
```

**架構原則**：HTML 講結構、CSS module 講樣式、JS module 講互動、JSON 講內容 —
四層分離，每個檔案單一職責、全部遠低於 800 行。

## 跑測試

```bash
npm install                  # 裝 Playwright + axe-core
npx playwright install chromium
npm test                     # 28 個 e2e（desktop + mobile 各 14）
```

## 點樣加 / 改一個 lesson

每個 lesson 嘅內容收喺 `data/annotations.json`（**唔使識 code 都改得**），結構如下：

```json
"my-section": {
  "cat": "design",
  "name": "Section Name",
  "zh": "中文名 · 又叫 ...",
  "hint": "tooltip 簡短一句",
  "plain": "白話一句講呢個係咩",
  "checklist": ["檢查點 1", "檢查點 2", "檢查點 3", "檢查點 4"],
  "quickFix": [
    { "problem": "常見症狀", "say": "抄返呢句畀 AI。" }
  ],
  "beforeAfter": {
    "bad":  ["差版 issue 1", "差版 issue 2"],
    "good": ["好版 win 1", "好版 win 2"]
  },
  "purpose": "...",
  "design": ["..."],
  "tech": ["..."],
  "code": "optional <span class=\"k|v|c\"> 上色嘅 snippet"
}
```

然後喺 `index.html` 用 `data-annotate data-id="my-section" data-cat="design"` 標到對應元素：

```html
<section data-annotate data-id="my-section" data-cat="design">...</section>
```

最後喺 `js/data.js` 嘅 `TOUR_ORDER` array 加入個 id（控制 Tour 順序）。
`data.js` 載入時會自動 validate 每個 lesson 有齊必要欄位。

## 而家有咩 lesson

| ID | 分類 | 英文名 | 中文 |
|----|------|--------|------|
| announce | structure | Announcement Bar | 公告條 |
| nav | structure | Navigation Bar | 導覽列 |
| dropdown | structure | Dropdown / Mega Menu | 下拉選單 |
| hero | structure | Hero Section | Hero 區 |
| eyebrow | design | Eyebrow | 眉標 |
| herocta | structure | Primary CTA | 主 CTA |
| modal | structure | Modal / Dialog | 彈出視窗 |
| socialproof | design | Social Proof | 社會證明 |
| herovisual | design | Hero Visual | 主視覺 |
| trust | design | Trust Bar | 信任列 |
| featuregrid | tech | Feature Grid (3-col) | 3 欄功能格 |
| featurecard | design | Feature Card | 功能卡 |
| zigzag | design | Zigzag Layout | 交錯排版 |
| ringtimer | tech | SVG Progress Ring | SVG 環形進度 |
| bento | design | Bento Grid | 便當格 |
| steps | structure | How It Works | 流程教學 |
| testimonial | design | Testimonial | 客戶評價 |
| pricing | design | Pricing Table | 收費表 |
| faq | tech | FAQ Accordion | 常見問題 |
| tooltip | tech | Info Tooltip / Popover | 懸停提示 |
| finalcta | structure | Final CTA | 結尾 CTA |
| footer | structure | Footer | 頁腳 |
| toast | design | Toast Notification | 浮動通知 |
| cookie | design | Cookie Banner | Cookie 通知 |

## Accessibility / 公開準備

呢個 tutorial 做過：

- ♿️ **WCAG 2.1 AA pass** — axe-core 0 violations（light + dark 兩個 mode 都 clean）
- ♿️ **鍵盤可用** — Tab 行 pin button；Enter / Space 開 detail；Esc 關 modal；Tour 用 ← →
- ♿️ **ARIA semantics** — `role=dialog / switch / tooltip / checkbox`、`aria-modal / expanded / checked / labelledby`、live region for tour progress
- ♿️ **Focus management** — 開 modal 跳入；關 modal focus 還原；focus trap stacked (celebrate > about > detail > intro)
- ♿️ **Skip-to-content** link — Tab 第一下就出
- ♿️ **`prefers-reduced-motion`** — 對動畫敏感嘅用家自動取消 hover / float / pulse
- ♿️ **無 nested-interactive** — 用 floating ℹ pin 做 keyboard 入口，避免 section 同內部 button 角色衝突
- 🌓 **Dark mode** — 跟 prefers-color-scheme，亦可手動 toggle，記低 preference
- 📱 **手機完整可用** — Inspector 底部 pill、Detail bottom sheet + drag handle + swipe-down 關
- 🎨 **`(hover: none)`** — touch 裝置自動隱藏 tooltip、提示文字切換
- 🔍 **Search + category filter** — Inspector 入面打字過濾、按分類顯示/隱藏
- 🎯 **Guided Tour mode** — 24 站順序、進度 1/24、完成有 celebration modal
- 🔗 **Deep linking** — `?lesson=xxx` 跳任何一課，URL 自動 sync
- 💾 **Progress 持久化** — localStorage 記住已睇過嘅 lesson + dark/light preference
- 📦 **PWA installable** — `manifest.json` + icons，可以 Add to Home Screen
- 🎯 **SEO 完整** — title、description、OG tags、Twitter card、theme-color、favicon、JSON-LD HowTo、sitemap.xml、robots.txt

## Open Graph image

社交分享圖用緊 `og-image.png`（1200×630），`index.html` 嘅 `og:image` / `twitter:image` 已經指向絕對 URL，社交平台兼容。`og-image.svg` 係原始 source。

## 用咗咩技術（純前端）

### Baseline web
CSS Variables · CSS Grid · Flexbox · clamp() · backdrop-filter（玻璃效果）· linear / radial gradient · perspective + rotate（3D mockup）· SVG stroke-dasharray（progress ring）· IntersectionObserver（scroll reveal）· cubic-bezier easing · pulse / float keyframe · max-height accordion trick

### 最新 Apple / Safari pioneered tech（2024–2026）
- **View Transitions API** — `document.startViewTransition()` 包住 Tour 切換,自動 morph 出 native app 般嘅 transition（Safari 18+ / Chrome 124+）
- **@property typed custom properties** — 用 `@property` 宣告 `--bg / --ink / --coral` 等為 `<color>` 類型,等 theme 切換時 CSS variable 直接 interpolate（Safari 16.4+）
- **CSS Scroll-driven animations** — scroll progress bar 用 `animation-timeline: scroll(root block)` 直接由 scroll 位置驅動,完全冇 JS scroll listener（Safari 26+ / Chrome 115+）。冇支援嘅 browser 自動 fallback JS
- **`text-wrap: balance` / `pretty`** — Headlines 自動平衡每行,長段落避免孤兒字。Apple-quality typography（Safari 17.4+）
- **Display P3 wide gamut** — `color(display-p3 ...)` 喺 P3 capable display 上更鮮豔嘅 brand 色,自動 fallback sRGB
- **`color-mix()`** — `color-mix(in srgb, var(--coral-text) 10%, transparent)` 取代手寫 rgba，跟 token 自動 update（CSS Color 5）
- **`color-scheme: light dark`** — 同 browser 講「我支援兩個 mode」，form controls / scrollbars 自動跟
- **WebShare API** — `navigator.share()` 喺 iOS / Android 用 native share sheet，desktop fallback clipboard
- **Vibration API（haptic）** — Tour next/prev 同 share success 加 micro haptic feedback
- **`@media (prefers-contrast: more)`** — Apple 「Increase Contrast」 a11y setting 自動跟
- **`@media (prefers-reduced-transparency: reduce)`** — Apple 「Reduce Transparency」 a11y setting 自動移走 backdrop-filter blur
- **`@media (prefers-color-scheme: dark)`** — 第一次訪客自動跟系統 mode

## 部署

純靜態 HTML — 任何 static host 都可以：

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod --dir=.

# GitHub Pages
# 將呢個 repo 設 Pages source = main branch root

# Cloudflare Pages
# Build command 空，output directory = /
```

## License

純教學用，**MIT** — 自由抄、自由改、自由用。

頁面入面個 **Lumo** 係虛構嘅產品，純粹示範用。**唔好真係攞去當 marketing 用。** 所有圖、客戶、評價、收費、stat 都係假嘅。
