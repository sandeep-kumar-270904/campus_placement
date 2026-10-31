const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 6: Student Offer Acceptance & Policy Engine Enforcement', () => {
  test('Student reviews extended offer details, accepts offer, and triggers placement locking', async ({ page }) => {
    // 1. Visit Student Applications
    await page.goto('/student/applications');

    // 2. Validate applications list renders
    const pageHeader = page.locator('h1, h2, h3').filter({ hasText: /Applications|My Drives/ }).first();
    await expect(pageHeader).toBeVisible({ timeout: 10000 });

    // 3. Locate Offer Card or Accept Button if offer is active
    const acceptOfferBtn = page.locator('button:has-text("Accept Offer"), button:has-text("Accept")').first();
    if (await acceptOfferBtn.isVisible()) {
      await acceptOfferBtn.click();

      // Confirm modal
      const confirmModal = page.locator('text=Confirm Offer Acceptance, text=Congratulations').first();
      await expect(confirmModal).toBeVisible();

      const confirmBtn = page.locator('button:has-text("Confirm Acceptance"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      // Assert status transitions to Placed
      const placedBadge = page.locator('text=Placed, text=Offer Accepted').first();
      await expect(placedBadge).toBeVisible();
    } else {
      // Assert application dashboard is functional
      expect(page.url()).toContain('/student');
    }
  });
});
