import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT) || 4173;
const localBaseURL = `http://127.0.0.1:${port}`;
const externalBaseURL = 'https://kakurai49.github.io/stories/';
const resolvedBaseURL =
  process.env.BASE_URL ??
  (process.env.RUN_EXTERNAL === '1' ? externalBaseURL : localBaseURL);

const useLocalServer = process.env.RUN_EXTERNAL !== '1';

export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: true,
    proxy: process.env.HTTPS_PROXY
      ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' }
      : process.env.HTTP_PROXY
        ? { server: process.env.HTTP_PROXY, bypass: 'localhost,127.0.0.1' }
        : undefined,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    // BASE_URL > RUN_EXTERNAL external URL > local static server
    baseURL: resolvedBaseURL,
    viewport: { width: 1280, height: 720 },
  },
  webServer: useLocalServer
    ? {
        command: 'node scripts/static-server.mjs',
        port,
        reuseExistingServer: true,
      }
    : undefined,
  /* Configure projects for major browsers. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
