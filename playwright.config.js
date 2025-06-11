import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */

// If you want to load .env, uncomment these lines:
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: ".",
  testMatch: [
    "api_tests/**/*.spec.js",
    "performance_tests/**/*.js",
    "stress_tests/**/*.spec.js",
    "ui_tests/**/*.spec.js",
  ],
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1, // For CI debugging, 1 worker is good; increase locally if desired
  reporter: "html",
  use: {
    baseURL: process.env.KINTSUGI_BASE_URL || "https://kintsugi.su",
    trace: "retain-on-failure",
    screenshot: "on",
    headless: true,
    ignoreHTTPSErrors: true,
    video: "on",
    // 'retry' is not a valid 'use' property (belongs at top-level as 'retries')
    // 'timeout' in 'use' is for each test step, not global, so use 'timeout' at top-level
    viewport: { width: 1920, height: 1080 },
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});