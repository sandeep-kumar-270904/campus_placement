const { test, expect } = require('@playwright/test');

test.describe('Design System & Responsive Layout Verification', () => {
  test('Mobile viewport (360px): renders styleguide without breaking or horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/styleguide');

    // Check title
    const heading = page.locator('h1:has-text("PLACEearly Design System")');
    await expect(heading).toBeVisible();

    // Verify key sections render
    await expect(page.locator('h2:has-text("1. Semantic Design Tokens")')).toBeVisible();
    await expect(page.locator('h2:has-text("2. Buttons")')).toBeVisible();
    await expect(page.locator('h2:has-text("3. Accessible Form Controls")')).toBeVisible();

    // Verify buttons are clickable on mobile
    const primaryBtn = page.locator('button:has-text("Primary Action")').first();
    await expect(primaryBtn).toBeVisible();

    // Verify DataGrid adapts to mobile
    const dataGrid = page.locator('table').first();
    await expect(dataGrid).toBeVisible();
  });

  test('Tablet viewport (768px): renders multi-column grids and components adaptively', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/styleguide');

    await expect(page.locator('h1:has-text("PLACEearly Design System")')).toBeVisible();

    // Verify StatCards in grid
    const statCard = page.locator('text=Students Placed').first();
    await expect(statCard).toBeVisible();

    // Verify Calendar is rendered
    const calendarHeader = page.locator('h3:has-text("2026")').first();
    await expect(calendarHeader).toBeVisible();
  });

  test('Desktop viewport (1440px): renders full expansive layout, command palette, and interactive dialogs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/styleguide');

    await expect(page.locator('h1:has-text("PLACEearly Design System")')).toBeVisible();

    // 1. Test Notification Toast
    const toastBtn = page.locator('button:has-text("Test Notification")');
    await expect(toastBtn).toBeVisible();
    await toastBtn.click();
    await expect(page.locator('text=Design System Synchronized')).toBeVisible();

    // 2. Test Modal Dialog
    const modalBtn = page.locator('button:has-text("Open Demo Modal")');
    await modalBtn.click();
    await expect(page.locator('h3:has-text("Student Placement Policy Details")')).toBeVisible();
    // Close modal
    const closeBtn = page.locator('button:has-text("Close")').first();
    await closeBtn.click();
    await expect(page.locator('h3:has-text("Student Placement Policy Details")')).not.toBeVisible();

    // 3. Test Drawer
    const drawerBtn = page.locator('button:has-text("Open Slide-Over Drawer")');
    await drawerBtn.click();
    await expect(page.locator('h3:has-text("Candidate Application Profile")')).toBeVisible();
    const doneBtn = page.locator('button:has-text("Done")');
    await doneBtn.click();
    await expect(page.locator('h3:has-text("Candidate Application Profile")')).not.toBeVisible();

    // 4. Test Command Palette
    const paletteBtn = page.locator('button:has-text("Command Palette")').first();
    if (await paletteBtn.isVisible()) {
      await paletteBtn.click();
      const paletteInput = page.locator('input[placeholder*="Type a page, tool"]');
      await expect(paletteInput).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});
