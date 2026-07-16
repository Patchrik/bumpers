import { test, expect } from '@playwright/test';

test('main heading is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('shows teams context element', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="{{teamsContextTestId}}"]')).toBeVisible({ timeout: 5000 });
});

test('screenshot: home page', async ({ page }) => {
  await page.goto('/');
  const screenshot = await page.screenshot({ fullPage: true });

  expect([...screenshot.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(screenshot.byteLength).toBeGreaterThan(1_000);
});
