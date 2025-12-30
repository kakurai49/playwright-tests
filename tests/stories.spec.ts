import { expect, Page, test } from '@playwright/test';

const targetUrl = process.env.STORIES_URL ?? 'https://kakurai49.github.io/stories/';

const attachNetworkDiagnostics = (page: Page, label: string) => {
  page.on('requestfailed', (request) => {
    console.log('[requestfailed]', label, request.url(), request.failure()?.errorText);
  });

  page.on('response', (response) => {
    console.log('[response]', label, response.status(), response.url());
  });
};

test('Stories ページをスクリーンショットできる', async ({ page }) => {
  let response;
  let screenshotPage = page;
  let fallbackUsed = false;

  attachNetworkDiagnostics(page, 'stories');

  try {
    // domcontentloaded までを優先的に待つことで、ネットワーク遅延時でも早期に状態を把握する
    response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });

    // Storybook のルート要素が付与されるまで待機し、描画確認用の同期ポイントを作る
    await page.waitForSelector('#storybook-root', { timeout: 5_000 });
  } catch (error) {
    fallbackUsed = true;
    console.error(`[goto-error] Failed to load ${targetUrl}:`, error);
    console.warn('[fallback] network access failed, using local content');

    screenshotPage = await page.context().newPage();
    attachNetworkDiagnostics(screenshotPage, 'stories-fallback');
    await screenshotPage.setContent(`
      <main>
        <h1>Stories ページにアクセスできませんでした</h1>
        <p>${targetUrl} への接続でエラーが発生しました。</p>
        <pre>${String(error)}</pre>
      </main>
    `);
  }

  await screenshotPage.screenshot({ path: 'test-results/stories-page.png', fullPage: true });

  if (fallbackUsed) {
    throw new Error('Stories page fallback was used; failing to surface network connectivity issues.');
  }

  if (response) {
    await expect.soft(response.status(), 'Stories ページのステータスコード').toBeLessThan(400);
  }
});
