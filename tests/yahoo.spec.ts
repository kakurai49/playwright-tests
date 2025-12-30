import { expect, Page, test } from '@playwright/test';

const port = process.env.PORT ?? '4173';
const fallbackBaseURL = `http://127.0.0.1:${port}`;
const externalYahooUrl = 'https://www.yahoo.com/';

const attachNetworkDiagnostics = (page: Page, label: string) => {
  page.on('requestfailed', (request) => {
    console.log('[requestfailed]', label, request.url(), request.failure()?.errorText);
  });

  page.on('response', (response) => {
    console.log('[response]', label, response.status(), response.url());
  });
};

const resolveYahooUrl = (baseURL?: string) => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }

  if (process.env.RUN_EXTERNAL === '1') {
    return externalYahooUrl;
  }

  return new URL('/yahoo/', baseURL ?? fallbackBaseURL).toString();
};

test.describe('Yahoo fixture (local)', () => {
  test('ローカル Yahoo 代替ページをスクリーンショットできる', async ({ page, baseURL }) => {
    const targetUrl = resolveYahooUrl(baseURL);
    attachNetworkDiagnostics(page, 'yahoo-local');

    const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.waitForSelector('[data-testid=\"yahoo-logo\"]', { timeout: 5_000 });
    await page.screenshot({ path: 'test-results/yahoo-home-local.png', fullPage: true });

    await expect.soft(response?.status(), 'Yahoo fixture のステータスコード').toBeLessThan(400);
  });
});

test.describe('Yahoo external (opt-in)', () => {
  test.skip(process.env.RUN_EXTERNAL !== '1', 'RUN_EXTERNAL=1 を指定した場合のみ外部疎通を試行します');

  test('Yahoo! トップページをスクリーンショットできる', async ({ page, baseURL }) => {
    let response;
    let screenshotPage = page;
    let fallbackUsed = false;

    const targetUrl = resolveYahooUrl(baseURL);
    attachNetworkDiagnostics(page, 'yahoo');

    try {
      // domcontentloaded までを優先的に待つことで、ネットワーク遅延時でも早期に状態を把握する
      response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 });

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
});
