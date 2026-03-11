import { test, expect } from '@playwright/test';

test.describe('Onboarding Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/apps/servo-selector?lang=zh');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('complete flow from onboarding to first axis', async ({ page }) => {
    // 1. Verify onboarding page
    await expect(page.locator('text=专业的伺服系统选型工具')).toBeVisible();
    await expect(page.locator('text=向导式配置')).toBeVisible();
    await expect(page.locator('text=智能计算')).toBeVisible();
    await expect(page.locator('text=专业报告')).toBeVisible();
    await expect(page.locator('text=开始配置项目')).toBeVisible();
    console.log('✓ Onboarding page displayed correctly');
    
    // Screenshot 1: Onboarding
    await page.screenshot({ path: 'e2e/screenshots/01-onboarding.png' });

    // 2. Click start button - should go to project info
    await page.click('text=开始配置项目');
    await page.waitForTimeout(1000);
    
    // 3. Should show project info edit form
    await expect(page.getByRole('heading', { name: '编辑项目信息' })).toBeVisible();
    console.log('✓ Project info edit form displayed');
    await page.screenshot({ path: 'e2e/screenshots/02-project-info.png' });
    
    // 4. Fill project info using placeholder
    await page.getByPlaceholder('请输入项目名称').fill('测试项目');
    await page.getByPlaceholder('请输入客户名称').fill('测试客户');
    
    // Click save
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(1000);
    
    // 5. Should show common params edit form
    await expect(page.getByRole('heading', { name: '编辑公共参数' })).toBeVisible();
    console.log('✓ Common params edit form displayed');
    await page.screenshot({ path: 'e2e/screenshots/03-common-params.png' });
    
    // 6. Save common params
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(1000);
    
    // 7. Should now show wizard with mechanism step
    await expect(page.getByRole('heading', { name: '机械参数' })).toBeVisible();
    console.log('✓ Mechanism step displayed');
    await page.screenshot({ path: 'e2e/screenshots/04-mechanism-step.png' });
    
    // 8. Verify sidebar shows the first axis (use exact match)
    await expect(page.getByText('轴-1', { exact: true })).toBeVisible();
    console.log('✓ First axis created and visible in sidebar');
    
    console.log('\n✅ All onboarding flow tests passed!');
  });
});
