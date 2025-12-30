import { defineConfig, devices } from '@playwright/test';

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
    // Allow overriding via BASE_URL to point to a local static server when external access is unreliable.
    baseURL: process.env.BASE_URL ?? 'https://www.yahoo.com',
    viewport: { width: 1280, height: 720 },
  },
  /* Configure projects for major browsers. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
