import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const targets = [
  {
    name: 'yahoo',
    description: 'Yahoo! JAPAN トップページ',
    url: 'https://www.yahoo.co.jp/',
    screenshot: 'test-results/yahoo-home-external.png',
    waitFor: 'main, body',
  },
  {
    name: 'stories',
    description: 'Stories 公開サイト',
    url: 'https://kakurai49.github.io/stories/',
    screenshot: 'test-results/stories-page-external.png',
    waitFor: '#storybook-root, body',
  },
];

const proxyServer = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

const createFallbackContent = (target, error) => `
  <main style="font-family: sans-serif; max-width: 960px; margin: 0 auto; padding: 32px;">
    <h1>${target.description} にアクセスできませんでした</h1>
    <p>ネットワーク制約などで ${target.url} への接続に失敗しました。</p>
    <p>以下のエラーを記録しました。環境設定を確認してください。</p>
    <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px;">${String(error)}</pre>
  </main>
`;

const captureWithFallback = async (context, target) => {
  await ensureDir(target.screenshot);
  const page = await context.newPage();

  try {
    const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForSelector(target.waitFor, { timeout: 10_000 });
    await page.screenshot({ path: target.screenshot, fullPage: true });
    console.log(`[ok] ${target.name} (${response?.status() ?? 'no-status'}) saved to ${target.screenshot}`);
    return { ok: true, status: response?.status() };
  } catch (error) {
    console.warn(`[fallback] ${target.name} failed to load, capturing diagnostic page.`, error);
    await page.close();

    const fallbackPage = await context.newPage();
    await fallbackPage.setContent(createFallbackContent(target, error));
    await fallbackPage.screenshot({ path: target.screenshot, fullPage: true });
    await fallbackPage.close();
    console.log(`[fallback] ${target.name} diagnostic saved to ${target.screenshot}`);
    return { ok: false, error };
  } finally {
    if (!page.isClosed()) {
      await page.close();
    }
  }
};

const run = async () => {
  const browser = await chromium.launch({
    headless: true,
    proxy: proxyServer ? { server: proxyServer, bypass: 'localhost,127.0.0.1' } : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  for (const target of targets) {
    await captureWithFallback(context, target);
  }

  await browser.close();
};

run().catch((error) => {
  console.error('[fatal] Failed to capture external screenshots', error);
  process.exitCode = 1;
});
