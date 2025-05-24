import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: ".",
  testMatch: [
    "api_tests/**/*.spec.js", // Changed to match .spec.js pattern
    "performance_tests/**/*.js",
    "stress_tests/**/*.spec.js", // Changed to match .spec.js pattern
    "ui_tests/**/*.spec.js",
  ],
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "https://kintsugi.su",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
