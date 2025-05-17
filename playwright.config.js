import { defineConfig, devices } from '@playwright/test';
// @ts-check

export default defineConfig({
  testDir: '.',
  testMatch: ['ui_tests/**/*.spec.js', 'api_tests/**/*.js', 
  'performance_tests/**/*.js', 'stress_tests/**/*.js'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://kintsugi.su',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
