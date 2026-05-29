import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { freshLoad } from './helpers.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page) {
  return new AxeBuilder({ page }).withTags(WCAG).analyze();
}

test.describe('Accessibility (axe-core WCAG 2.1 AA)', () => {
  test('Intro 畫面 — light，0 violations', async ({ page }) => {
    await freshLoad(page);
    const results = await scan(page);
    expect(results.violations).toEqual([]);
  });

  test('Detail panel 開住 — light，0 violations', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    await page.locator('.annotate-pin[data-pin-for="hero"]').click();
    await expect(page.locator('#detail')).toHaveClass(/open/);
    await page.waitForTimeout(500);   // 等 panel slide-in transition settle 再掃
    const results = await scan(page);
    expect(results.violations).toEqual([]);
  });

  test('進度 > 0 + Dark mode — 0 violations', async ({ page }) => {
    await freshLoad(page);
    await page.locator('#introClose').click();
    // 製造 progress（睇一個 lesson）
    await page.locator('.annotate-pin[data-pin-for="hero"]').click();
    await page.keyboard.press('Escape');
    // 切 dark
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(450);   // 等 theme color transition (0.35s) settle 再掃
    const results = await scan(page);
    expect(results.violations).toEqual([]);
  });
});
