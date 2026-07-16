import { test, expect } from '@playwright/test';

test('home page renders without navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('{{reactHeadingTestId}}')).toHaveText('{{projectName}}');

  await page.getByTestId('{{reactCounterIncrementTestId}}').click();
  await expect(page.getByTestId('{{reactCounterTestId}}')).toHaveText('1');
  await expect(page.getByRole('link', { name: 'About' })).toHaveCount(0);
});

test('screenshot: home page', async ({ page }) => {
  await page.goto('/');
  const screenshot = await page.screenshot({ fullPage: true });

  expect([...screenshot.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(screenshot.byteLength).toBeGreaterThan(1_000);
});
