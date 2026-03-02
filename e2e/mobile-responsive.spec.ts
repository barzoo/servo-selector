import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive', () => {
  test('should display correctly on iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that step indicator is visible
    const stepIndicator = page.locator('[class*="rounded-full"]').first();
    await expect(stepIndicator).toBeVisible();

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('iphone-se-wizard.png');
  });

  test('should display correctly on iPad', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('ipad-wizard.png');
  });
});
