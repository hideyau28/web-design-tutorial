import { expect } from '@playwright/test';

/** 開頁 + 等到 module boot 完成（24 個 pin build 好）。
 *  Playwright 每個 test 本身就係 isolated context（空 localStorage），
 *  所以唔需要手動 clear — clear 會破壞 reload persistence 測試。*/
export async function freshLoad(page) {
  await page.goto('/');
  await expect(page.locator('.annotate-pin')).toHaveCount(24, { timeout: 10000 });
}

/** 撳「跟住 Tour」開始 guided tour */
export async function startTour(page) {
  await page.locator('#introStartTour').click();
  await expect(page.locator('#detail')).toHaveClass(/open/, { timeout: 5000 });
}
