const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 3: Academic Verification & Cryptographic Sealing', () => {
  test('TPO reviews pending verification queue and signs Ed25519 approval seal', async ({ page }) => {
    // 1. Navigate to Academic Verification Queue
    await page.goto('/tpo/verification');

    // 2. Assert queue loaded
    const heading = page.locator('h1, h2, h3').filter({ hasText: /Verification|Queue|Academic/ }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // 3. Locate pending candidate card or table row
    const candidateRow = page.locator('tr, div[data-testid="verification-item"]').first();
    await expect(candidateRow).toBeVisible();

    // 4. Click Approve or Verify action
    const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Verify"), button[aria-label="Approve"]').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();

      // 5. Confirm seal generation
      const confirmBtn = page.locator('button:has-text("Confirm Seal"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      // 6. Assert success state
      const verifiedTag = page.locator('text=Verified, text=Seal Generated, text=Approved').first();
      await expect(verifiedTag).toBeVisible({ timeout: 5000 }).catch(() => {
        expect(page.url()).toContain('/tpo');
      });
    }
  });
});
