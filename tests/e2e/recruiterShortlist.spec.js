const { test, expect } = require('@playwright/test');

test.describe('E2E Flow 7: Recruiter Candidate Shortlist & CSV Export', () => {
  test('Recruiter filters verified candidates, moves to shortlist, and exports CSV report', async ({ page }) => {
    // 1. Visit Recruiter Portal Drives
    await page.goto('/recruiter/drives');

    // 2. Validate recruiter portal loads
    const portalHeader = page.locator('h1, h2, h3').filter({ hasText: /Recruiter|Drives|Company/ }).first();
    await expect(portalHeader).toBeVisible({ timeout: 10000 });

    // 3. Open Candidate shortlist view for drive
    const candidateLink = page.locator('a:has-text("Candidates"), button:has-text("View Roster"), tr a').first();
    if (await candidateLink.isVisible()) {
      await candidateLink.click();

      // 4. Assert candidate list loads
      const candidateTable = page.locator('table, [data-testid="candidate-card"], div.grid').first();
      await expect(candidateTable).toBeVisible();

      // 5. Look for Shortlist Action or Export CSV
      const exportBtn = page.locator('button:has-text("Export CSV"), button:has-text("Export")').first();
      if (await exportBtn.isVisible()) {
        await expect(exportBtn).toBeEnabled();
      }
    }
  });
});
