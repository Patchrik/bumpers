import { test, expect } from '@playwright/test';

test('home page renders and navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('{{reactHeadingTestId}}')).toHaveText('{{projectName}}');

  await page.getByTestId('{{reactCounterIncrementTestId}}').click();
  await expect(page.getByTestId('{{reactCounterTestId}}')).toHaveText('1');

  await page.getByTestId('{{reactNavAboutTestId}}').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
});

test('screenshot: about page', async ({ page }) => {
  await page.goto('/about');
  const screenshot = await page.screenshot({ fullPage: true });

  expect([...screenshot.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(screenshot.byteLength).toBeGreaterThan(1_000);
});
