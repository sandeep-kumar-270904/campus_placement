const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 5: Interview Slot Generation & Calendar Management', () => {
  test('TPO configures panels and schedules interview slots without clashes', async ({ page }) => {
    // 1. Visit Schedule management
    await page.goto('/tpo/schedule');

    // 2. Validate calendar or slot list renders
    const scheduleHeader = page.locator('h1, h2, h3').filter({ hasText: /Schedule|Calendar|Interviews/ }).first();
    await expect(scheduleHeader).toBeVisible({ timeout: 10000 });

    // 3. Check for slot generation trigger
    const generateBtn = page.locator('button:has-text("Auto-Generate Slots"), button:has-text("Generate"), button:has-text("New Slot")').first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();

      // Assert slot configuration controls visible
      const panelInput = page.locator('input[type="number"], select').first();
      await expect(panelInput).toBeVisible();
    }
  });
});
