import { test, expect } from '@playwright/test';
import { freshLoad, startTour } from './helpers.js';

test.describe('Onboarding 同 Intro', () => {
  test('落地顯示 intro modal，focus 落 primary CTA', async ({ page }) => {
    await freshLoad(page);
    await expect(page.locator('#intro')).not.toHaveClass(/hidden/);
    await expect(page.locator('#introTitle')).toContainText('教你同 AI 講設計');
    // 24 lessons 載入（fetch JSON 成功）
    await expect(page.locator('#progressTotal')).toHaveText('24');
  });

  test('「自由探索」關 intro 入產品頁', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await expect(page.locator('#intro')).toHaveClass(/hidden/);
  });
});

test.describe('Guided Tour', () => {
  test('行足 24 站 → 觸發 celebration', async ({ page }) => {
    await freshLoad(page);
    await startTour(page);
    await expect(page.locator('#detailName')).toHaveText('Announcement Bar');
    await expect(page.locator('#detailProgress')).toHaveText('1 / 24');

    // 撳「下一個」行到尾
    for (let i = 0; i < 24; i++) {
      await page.locator('#detailNext').click();
      await page.waitForTimeout(120);
    }
    // 完成 → celebration 開，數字 = 24
    await expect(page.locator('#celebrate')).not.toHaveClass(/hidden/);
    await expect(page.locator('#celebrateLead')).toContainText('24 個 pattern');
  });

  test('每站 active highlight 對應正確元素', async ({ page }) => {
    await freshLoad(page);
    await startTour(page);
    // 第 1 站 announce
    await expect(page.locator('[data-annotate][data-id="announce"]')).toHaveClass(/annotate-active/);
    await page.locator('#detailNext').click();
    await page.waitForTimeout(200);
    // 第 2 站 nav
    await expect(page.locator('[data-annotate][data-id="nav"]')).toHaveClass(/annotate-active/);
  });
});

test.describe('Free explore', () => {
  test('撳 pin 開 detail panel，內容齊全', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('.annotate-pin[data-pin-for="hero"]').click();
    await expect(page.locator('#detail')).toHaveClass(/open/);
    await expect(page.locator('#detailName')).toHaveText('Hero Section');
    // 4 大 field render 咗
    await expect(page.locator('#dPlain')).not.toBeEmpty();
    await expect(page.locator('#dChecklist li')).not.toHaveCount(0);
    await expect(page.locator('#dQuickFix .quickfix-item')).not.toHaveCount(0);
    await expect(page.locator('#dBaBad li')).not.toHaveCount(0);
  });

  test('Esc 關 detail panel', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('.annotate-pin[data-pin-for="hero"]').click();
    await expect(page.locator('#detail')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#detail')).not.toHaveClass(/open/);
  });
});

test.describe('Search 同 Filter', () => {
  test('搜尋字眼過濾 lesson', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('#annSearch').fill('modal');
    // 命中嘅 glow，其餘 hidden
    await expect(page.locator('[data-annotate][data-id="modal"]')).toHaveClass(/filter-match-glow/);
    await expect(page.locator('[data-annotate].filter-hidden')).not.toHaveCount(0);
  });

  test('分類 chip 隱藏對應 lesson', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('[data-cat-filter="structure"]').click();
    // structure lessons 隱藏（9 個）
    await expect(page.locator('[data-annotate][data-cat="structure"].filter-hidden')).toHaveCount(9);
  });
});

test.describe('Dark mode', () => {
  test('Toggle + localStorage 持久化', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // reload 後仍然 dark
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Deep link', () => {
  test('?lesson=pricing 直接開到 Pricing Table', async ({ page }) => {
    await page.goto('/?lesson=pricing');
    await expect(page.locator('#detail')).toHaveClass(/open/, { timeout: 10000 });
    await expect(page.locator('#detailName')).toHaveText('Pricing Table');
  });
});

test.describe('Progress persist', () => {
  test('睇過嘅 lesson 跨 reload 保留', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('.annotate-pin[data-pin-for="hero"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#progressCount')).toHaveText('1');
    await page.reload();
    await expect(page.locator('#progressCount')).toHaveText('1');
    await expect(page.locator('[data-annotate][data-id="hero"]')).toHaveClass(/annotate-visited/);
  });
});
