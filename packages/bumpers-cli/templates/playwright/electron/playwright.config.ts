import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  snapshotDir: './e2e/__screenshots__',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    trace: 'on-first-retry',
  },
  // Build the Electron app before running E2E tests.
  // Playwright needs the compiled output — the dev server won't work for E2E.
  webServer: {
    command: '{{runPrefix}} build',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
