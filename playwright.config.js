import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration
 */

// If you want to load .env, uncomment below:
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
  timeout: 60000, // per test
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1, // Set higher locally if you want more parallelism
  reporter: "html",
  use: {
    baseURL: process.env.KINTSUGI_BASE_URL || "https://kintsugi.su",
    trace: "retain-on-failure",
    screenshot: "on",
    headless: true, // Always run headless in CI
    ignoreHTTPSErrors: true,
    video: "on",
    viewport: { width: 1920, height: 1080 },
    navigationTimeout: 30000,
    actionTimeout: 15000,
    // No 'retry' or 'timeout' here; they are at top-level
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Uncomment below to enable more browsers:
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