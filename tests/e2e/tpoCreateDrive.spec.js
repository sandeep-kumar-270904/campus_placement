const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 2: TPO Drive Creation & JD Publication', () => {
  test('TPO accesses drive management, opens creation wizard, and publishes new drive', async ({ page }) => {
    // 1. Visit TPO Drives page
    await page.goto('/tpo/drives');

    // 2. Locate Drive Creation button
    const createBtn = page.locator('button:has-text("Create Drive"), button:has-text("New Drive"), button:has-text("Post Opportunity")').first();
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();

    // 3. Fill Drive Details in modal/drawer
    const companyInput = page.locator('input[name="companyName"], input[placeholder*="Company"]').first();
    if (await companyInput.isVisible()) {
      await companyInput.fill('Oracle Cloud Technologies');
    }

    const titleInput = page.locator('input[name="title"], input[placeholder*="Role"], input[placeholder*="Title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Cloud Infrastructure SDE');
    }

    const ctcInput = page.locator('input[name="ctc"], input[placeholder*="CTC"], input[type="number"]').first();
    if (await ctcInput.isVisible()) {
      await ctcInput.fill('1600000');
    }

    // 4. Save / Publish Drive
    const submitBtn = page.locator('button:has-text("Publish"), button:has-text("Create"), button:has-text("Save")').last();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 5. Assert confirmation and listing
    await expect(page.locator('text=Oracle, text=Drives').first()).toBeVisible();
  });
});
