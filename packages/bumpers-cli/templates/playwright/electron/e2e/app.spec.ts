import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { resolve } from "node:path";

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: [resolve(__dirname, "..")],
  });
  page = await app.firstWindow();
  // Wait for the renderer to fully load before running tests
  await page.waitForLoadState("domcontentloaded");
});

test.afterAll(async () => {
  await app.close();
});

test("app window opens with correct title", async () => {
  const title = await page.title();
  expect(title).toBeDefined();
});

test("main heading is visible", async () => {
  await expect(page.locator("h1")).toBeVisible();
});

test("example items render from IPC", async () => {
  await expect(
    page.locator('[data-testid="{{exampleItemTestId}}"]').first(),
  ).toBeVisible({ timeout: 5000 });
});

test("screenshot: home page", async () => {
  await expect(page).toHaveScreenshot("home-page.png");
});
