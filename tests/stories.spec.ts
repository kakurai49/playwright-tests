import { expect, Page, test } from '@playwright/test';

const port = process.env.PORT ?? '4173';
const fallbackBaseURL = `http://127.0.0.1:${port}`;
const externalStoriesUrl = 'https://kakurai49.github.io/stories/';

const attachNetworkDiagnostics = (page: Page, label: string) => {
  page.on('requestfailed', (request) => {
    console.log('[requestfailed]', label, request.url(), request.failure()?.errorText);
  });

  page.on('response', (response) => {
    console.log('[response]', label, response.status(), response.url());
  });
};

const resolveStoriesUrl = (baseURL?: string) => {
  if (process.env.BASE_URL) {
    return new URL('/stories/', process.env.BASE_URL).toString();
  }

  if (process.env.RUN_EXTERNAL === '1') {
    return externalStoriesUrl;
  }

  return new URL('/stories/', baseURL ?? fallbackBaseURL).toString();
};

test.describe('Stories fixture (local)', () => {
  test('ローカル fixture の Storybook root を確認できる', async ({ page, baseURL }) => {
    const targetUrl = resolveStoriesUrl(baseURL);
    attachNetworkDiagnostics(page, 'stories-local');

    const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.waitForSelector('#storybook-root', { timeout: 5_000 });
    await page.screenshot({ path: 'test-results/stories-page-local.png', fullPage: true });

    await expect.soft(response?.status(), 'Stories fixture のステータスコード').toBeLessThan(400);
  });
});

test.describe('Stories external (opt-in)', () => {
  test.skip(process.env.RUN_EXTERNAL !== '1', 'RUN_EXTERNAL=1 を指定した場合のみ外部疎通を試行します');

  test('Stories ページをスクリーンショットできる', async ({ page, baseURL }) => {
    let response;
    let screenshotPage = page;
    let fallbackUsed = false;

    const targetUrl = resolveStoriesUrl(baseURL);
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
});
