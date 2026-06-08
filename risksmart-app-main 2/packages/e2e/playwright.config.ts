import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  globalSetup: 'globalSetup.ts',
  globalTeardown: 'globalTeardown.ts',
  // Testing with default of 30s
  //timeout: process.env.CI ? 120000 : undefined,
  webServer: {
    command: 'pnpm run preview',
    cwd: '../../',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  expect: {
    toHaveScreenshot: { threshold: 0 },
  },
  use: {
    // Capture screenshot after each test failure.
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:3000/',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    bypassCSP: true,
    launchOptions: {
      args: ['--disable-web-security'],
    },
  },
  testDir: 'tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 8,
  reporter: 'html',
  projects: [
    {
      name: 'all',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
