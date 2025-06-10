import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */

// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: ".",
  testMatch: [
    "api_tests/**/*.spec.js", // Changed to match .spec.js pattern
    "performance_tests/**/*.js",
    "stress_tests/**/*.spec.js", // Changed to match .spec.js pattern
    "ui_tests/**/*.spec.js",
  ],  timeout: process.env.CI ? 120000 : 60000,
  expect: {
    timeout: process.env.CI ? 30000 : 15000,
  },
  fullyParallel: true,  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  reportSlowTests: { max: 5, threshold: 15000 },
  use: {
    baseURL: "https://kintsugi.su",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: true,
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },    navigationTimeout: process.env.CI ? 60000 : 30000,
    actionTimeout: process.env.CI ? 30000 : 15000,
    launchOptions: {
      slowMo: process.env.CI ? 100 : 0,
    },
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
