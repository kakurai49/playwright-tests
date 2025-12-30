import { expect, test } from '@playwright/test';

test('Yahoo! トップページをスクリーンショットできる', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // ログインモーダルなどが表示されても全体のレンダリングを待つ
  await page.waitForTimeout(2000);

  const title = await page.title();
  expect(title).toContain('Yahoo');

  await page.screenshot({ path: 'test-results/yahoo-home.png', fullPage: true });
});
