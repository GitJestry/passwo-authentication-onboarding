import { defineConfig, devices } from '@playwright/test';

const desktopChrome = devices['Desktop Chrome'];
if (desktopChrome === undefined) {
  throw new Error('Playwright Desktop Chrome device profile is unavailable.');
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...desktopChrome },
    },
  ],
  webServer: {
    command: 'pnpm --filter @passwo/study-web dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
