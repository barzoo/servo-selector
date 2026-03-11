import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page first
    await page.goto('http://localhost:3000/apps/servo-selector?lang=zh');
    // Clear storage and reload to ensure fresh state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('should display onboarding page for first-time users', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for hero title
    const heroTitle = page.locator('text=专业的伺服系统选型工具');
    await expect(heroTitle).toBeVisible();

    // Check for feature cards
    await expect(page.locator('text=向导式配置')).toBeVisible();
    await expect(page.locator('text=智能计算')).toBeVisible();
    await expect(page.locator('text=专业报告')).toBeVisible();

    // Check for process preview
    await expect(page.locator('text=阶段一：项目配置')).toBeVisible();
    await expect(page.locator('text=阶段二：轴配置')).toBeVisible();

    // Check for CTA button
    const startButton = page.locator('text=开始配置项目');
    await expect(startButton).toBeVisible();
  });

  test('should navigate to project info when clicking start button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click start button
    await page.click('text=开始配置项目');

    // Should show project info edit form
    await expect(page.locator('text=编辑项目信息')).toBeVisible();
  });

  test('should display onboarding in English when lang=en', async ({ page }) => {
    // Navigate and clear storage
    await page.goto('http://localhost:3000/apps/servo-selector?lang=en');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(500);

    // Check for English hero title
    const heroTitle = page.locator('text=Professional Servo Sizing Tool');
    await expect(heroTitle).toBeVisible();

    // Check for English feature cards
    await expect(page.locator('text=Guided Configuration')).toBeVisible();
    await expect(page.locator('text=Smart Calculation')).toBeVisible();
    await expect(page.locator('text=Professional Report')).toBeVisible();
  });
});
