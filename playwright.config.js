const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright E2E Test Suite Configuration
 * Configured for headless CI smoke testing and local visual browser runs.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/e2e/reports/test-results.json' }],
    ['html', { outputFolder: 'tests/e2e/reports/html', open: 'never' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: 'npm run start',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120000,
      }
    : undefined,
});
