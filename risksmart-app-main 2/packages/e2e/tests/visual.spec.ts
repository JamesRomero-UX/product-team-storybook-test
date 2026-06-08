import { expect } from '@playwright/test';

import { test } from '../base';

test(`Homepage renders correctly`, async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=Dashboard');
  await expect(page).toHaveScreenshot();
});

test(`Risk Register renders correctly`, async ({ page }) => {
  await page.goto('/risks');
  await page.waitForSelector('text=Risk Register');
  await expect(page).toHaveScreenshot();
});

test(`Issue Register renders correctly`, async ({ page }) => {
  await page.goto('/issues');
  await page.waitForSelector('text=Issue Register');
  await expect(page).toHaveScreenshot();
});
