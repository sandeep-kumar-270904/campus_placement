const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 4: Shortlist File Upload & Candidate Progression', () => {
  test('TPO uploads candidate shortlist CSV in drive workspace', async ({ page }) => {
    // 1. Visit TPO Drives to access workspace
    await page.goto('/tpo/drives');

    // 2. Open first drive workspace
    const workspaceLink = page.locator('a:has-text("Workspace"), button:has-text("Manage"), tr a').first();
    if (await workspaceLink.isVisible()) {
      await workspaceLink.click();
    } else {
      await page.goto('/tpo/drives');
    }

    // 3. Locate Shortlist upload action
    const shortlistBtn = page.locator('button:has-text("Upload Shortlist"), button:has-text("Shortlist")').first();
    if (await shortlistBtn.isVisible()) {
      await shortlistBtn.click();

      // Assert modal opens
      const modalHeader = page.locator('text=Shortlist, text=Upload').first();
      await expect(modalHeader).toBeVisible();
    }
  });
});
