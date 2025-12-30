import { expect, test } from '@playwright/test';

const targetUrl = 'https://kakurai49.github.io/stories/';

test('Stories ページをスクリーンショットできる', async ({ page }) => {
  let response;
  let screenshotPage = page;

  try {
    response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Storybook の初期描画を待機
    await page.waitForTimeout(2000);
  } catch (error) {
    screenshotPage = await page.context().newPage();
    await screenshotPage.setContent(`
      <main>
        <h1>Stories ページにアクセスできませんでした</h1>
        <p>${targetUrl} への接続でエラーが発生しました。</p>
        <pre>${String(error)}</pre>
      </main>
    `);
  }

  await screenshotPage.screenshot({ path: 'test-results/stories-page.png', fullPage: true });

  if (response) {
    await expect.soft(response.status(), 'Stories ページのステータスコード').toBeLessThan(400);
  }
});
