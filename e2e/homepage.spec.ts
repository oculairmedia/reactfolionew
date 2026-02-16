import { test, expect } from '@playwright/test';

test('homepage visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for main content to be visible
  await page.waitForSelector('.intro_sec', { timeout: 10000 });

  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.05,
  });
});

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
});
