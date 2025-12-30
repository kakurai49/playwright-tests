import { expect, Page, test } from '@playwright/test';

const attachNetworkDiagnostics = (page: Page, label: string) => {
  page.on('requestfailed', (request) => {
    console.log('[requestfailed]', label, request.url(), request.failure()?.errorText);
  });

  page.on('response', (response) => {
    console.log('[response]', label, response.status(), response.url());
  });
};

test('Yahoo! トップページをスクリーンショットできる', async ({ page }) => {
  let response;
  let screenshotPage = page;
  let fallbackUsed = false;

  attachNetworkDiagnostics(page, 'yahoo');

  try {
    // domcontentloaded までを優先的に待つことで、ネットワーク遅延時でも早期に状態を把握する
    response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15_000 });

    // メインナビの存在を待つことで描画確認用の同期ポイントを作る
    await page.waitForSelector('main, body', { timeout: 5_000 });
  } catch (error) {
    fallbackUsed = true;
    console.error('[goto-error] Failed to load Yahoo! homepage:', error);
    console.warn('[fallback] network access failed, using local content');

    screenshotPage = await page.context().newPage();
    attachNetworkDiagnostics(screenshotPage, 'yahoo-fallback');
    await screenshotPage.setContent(`
      <main>
        <h1>Yahoo! トップページにアクセスできませんでした</h1>
        <p>ネットワーク制限などの理由でリクエストがブロックされた可能性があります。</p>
        <pre>${String(error)}</pre>
      </main>
    `);
  }

  await screenshotPage.screenshot({ path: 'test-results/yahoo-home.png', fullPage: true });

  if (fallbackUsed) {
    throw new Error('Yahoo page fallback was used; failing to surface network connectivity issues.');
  }

  if (response) {
    const title = await page.title();
    await expect.soft(title).toContain('Yahoo');
  }
});
