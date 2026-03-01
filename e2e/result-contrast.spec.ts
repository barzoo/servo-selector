import { test, expect } from '@playwright/test';

test.describe('ResultStep Contrast Analysis', () => {
  test('capture result page screenshot for contrast analysis', async ({ page }) => {
    // Capture all console messages
    const consoleMessages: { type: string; text: string; location?: string }[] = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url
      });
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log('Page error:', error.message);
    });

    // Capture failed requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check if there are any scripts loaded
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map(s => s.src);
    });
    console.log('Scripts loaded:', scripts);

    // Check for React root
    const hasReactRoot = await page.evaluate(() => {
      return document.querySelector('#__next') !== null ||
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('[data-react-checksum]') !== null;
    });
    console.log('Has React root:', hasReactRoot);

    // Take initial screenshot
    await page.screenshot({
      path: 'e2e/screenshots/step0-initial.png',
      fullPage: true
    });

    // Try to find and interact with the form
    const nameInput = page.locator('input#name');
    const isVisible = await nameInput.isVisible().catch(() => false);
    console.log('Name input visible:', isVisible);

    if (isVisible) {
      // Use clear then type approach for React controlled inputs
      await nameInput.clear();
      await nameInput.type('测试项目', { delay: 10 });

      const customerInput = page.locator('input#customer');
      await customerInput.clear();
      await customerInput.type('测试客户', { delay: 10 });

      const salesInput = page.locator('input#salesPerson');
      await salesInput.clear();
      await salesInput.type('测试销售', { delay: 10 });

      // Check values are set
      const nameValue = await nameInput.inputValue();
      console.log('Name value after type:', nameValue);

      await page.screenshot({
        path: 'e2e/screenshots/step1-filled.png',
        fullPage: true
      });

      // Find and click submit button
      const submitButton = page.locator('button[type="submit"]');
      const buttonVisible = await submitButton.isVisible().catch(() => false);
      console.log('Submit button visible:', buttonVisible);

      if (buttonVisible) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'e2e/screenshots/step2-after-submit.png',
          fullPage: true
        });
      }
    }

    // Get final page state
    const finalUrl = page.url();
    const pageTitle = await page.title();
    console.log('Final URL:', finalUrl);
    console.log('Page title:', pageTitle);

    // Save debug info
    const fs = require('fs');
    fs.mkdirSync('e2e/screenshots', { recursive: true });
    fs.writeFileSync('e2e/debug-info.json', JSON.stringify({
      consoleMessages,
      pageErrors,
      failedRequests,
      scripts,
      hasReactRoot,
      finalUrl,
      pageTitle
    }, null, 2));

    console.log('Debug info saved');
  });
});
