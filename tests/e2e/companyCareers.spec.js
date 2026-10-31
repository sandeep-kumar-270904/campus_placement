const { test, expect } = require('@playwright/test');

test.describe('Top Company Careers Directory Page', () => {
  test('Renders company careers page with search, categories, and direct portal links', async ({ page }) => {
    await page.goto('/career-pages');

    // 1. Verify page title & counter
    await expect(page.locator('h1:has-text("Top MNC, PBC & GCC Career Hub")')).toBeVisible();
    await expect(page.locator('span:has-text("Official Career Portals")').first()).toBeVisible();

    // 2. Search for Google
    const searchInput = page.locator('input[placeholder*="Search companies"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Google');

    // Google card should be visible
    await expect(page.locator('h3:has-text("Google")')).toBeVisible();
    await expect(page.locator('p:has-text("Global technology leader in search")')).toBeVisible();

    // Check direct external careers link
    const careersLink = page.locator('a:has-text("Careers Portal")').first();
    await expect(careersLink).toHaveAttribute('href', /careers\.google\.com/);

    // 3. Search for Flipkart, Cred, Walmart, Cisco
    await searchInput.fill('Flipkart');
    await expect(page.locator('h3:has-text("Flipkart")')).toBeVisible();

    await searchInput.fill('Cred');
    await expect(page.locator('h3:has-text("CRED")')).toBeVisible();

    await searchInput.fill('Walmart');
    await expect(page.locator('h3:has-text("Walmart Global Tech")')).toBeVisible();

    await searchInput.fill('Cisco');
    await expect(page.locator('h3:has-text("Cisco Systems")')).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // 4. Test Category Filter (e.g. GCC)
    const gccTab = page.locator('button[role="tab"]:has-text("Global Capability Center")').first();
    if (await gccTab.isVisible()) {
      await gccTab.click();
      await expect(page.locator('h3:has-text("Target Enterprise India")')).toBeVisible();
      await expect(page.locator('h3:has-text("Lowe’s India GCC")')).toBeVisible();
    }

    // 5. Test Company Details Drawer
    const companyCard = page.locator('h3:has-text("Target Enterprise India")').first();
    await companyCard.click();

    // Drawer should open with ATS advice
    await expect(page.locator('h5:has-text("ATS Screening & Interview Preparation Tips")')).toBeVisible();
    await expect(page.locator('text=Locations & India Engineering Centers')).toBeVisible();

    // Close drawer
    const closeBtn = page.locator('button:has-text("Close")').first();
    await closeBtn.click();
    await expect(page.locator('h5:has-text("ATS Screening & Interview Preparation Tips")')).not.toBeVisible();
  });
});
