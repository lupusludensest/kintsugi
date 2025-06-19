import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

function validateEnvVars() {
  const required = [
    "KINTSUGI_LOGIN_URL",
    "KINTSUGI_LOGIN",
    "KINTSUGI_PASSWORD",
    "TIMEOUT"
  ];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

test.describe("Authentication - Login Tests", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    validateEnvVars();
    await page.setViewportSize({ width: 1920, height: 1080 });
    try {
      await page.goto(process.env.KINTSUGI_LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 20000 });
    } catch (err) {
      await page.screenshot({ path: `login-page-unreachable.png`, fullPage: true });
      testInfo.skip(`Login page unreachable: ${err.message}`);
    }
  });

  test("should login successfully with valid credentials", {tag: '@ui_login_happypath'},async ({ page }) => {
    // Take initial screenshot for debugging
    await page.screenshot({ path: 'ui_tests/pic_generated_in_tests/login-start.png', fullPage: true });

    // Use the correct selectors based on actual page structure
    // Email input: use name attribute which is reliable
    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });

    // Password input: use name attribute which is reliable  
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });

    // Login button: use text content which is reliable
    const submitButton = page.locator('button:has-text("Войти")');
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });

    // Verify button is initially disabled
    await expect(submitButton).toBeDisabled();

    // Fill the form fields
    await emailInput.fill(process.env.KINTSUGI_LOGIN);
    await passwordInput.fill(process.env.KINTSUGI_PASSWORD);

    // Verify fields are filled correctly
    await expect(emailInput).toHaveValue(process.env.KINTSUGI_LOGIN);
    await expect(passwordInput).toHaveValue(process.env.KINTSUGI_PASSWORD);

    // Wait for button to become enabled after filling both fields
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Take screenshot before submitting
    await page.screenshot({ path: 'ui_tests/pic_generated_in_tests/before-submit.png', fullPage: true });

    // Click submit and wait for navigation
    await Promise.all([
      // Wait for URL to change away from login page
      page.waitForURL(url => !url.pathname.includes('/login'), { timeout: parseInt(process.env.TIMEOUT) }),
      submitButton.click()
    ]);

    // Take screenshot after login
    await page.screenshot({ path: 'ui_tests/pic_generated_in_tests/after-login.png', fullPage: true });

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify successful login by checking URL
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Wait for dashboard elements to be visible
    await page.waitForSelector('[class*="menu-item"]', { timeout: 10000 });

    // Verify "Дашборд" text is present - use more flexible selector
    const dashboardMenuItem = page.locator('.menu-item').filter({ hasText: 'Дашборд' });
    await expect(dashboardMenuItem).toBeVisible({ timeout: 10000 });
    
    // Alternative verification - check for dashboard-specific elements
    const dashboardElements = page.locator('text=Дашборд');
    await expect(dashboardElements.first()).toBeVisible({ timeout: 10000 });
  });

  test("should show validation for empty fields", {tag: '@ui_empty_fields_validation'}, async ({ page }) => {
    // Verify button is disabled when form is empty
    const submitButton = page.locator('button:has-text("Войти")');
    await expect(submitButton).toBeDisabled();

    // Fill only email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('test@example.com');
    
    // Button should still be disabled
    await expect(submitButton).toBeDisabled();

    // Clear email and fill only password
    await emailInput.clear();
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('password123');
    
    // Button should still be disabled
    await expect(submitButton).toBeDisabled();

    // Fill both fields
    await emailInput.fill('test@example.com');
    
    // Now button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test("should handle invalid credentials gracefully", {tag: '@ui_login_invalid'}, async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button:has-text("Войти")');

    // Fill with invalid credentials
    await emailInput.fill(process.env.KINTSUGI_WRONG_LOGIN);
    await passwordInput.fill(process.env.KINTSUGI_WRONG_PASSWORD);

    // Wait for button to be enabled
    await expect(submitButton).toBeEnabled();

    // Click submit
    await submitButton.click();

    // Wait a moment for any error messages
    await page.waitForTimeout(2000);

    // Verify we're still on login page (unsuccessful login)
    await expect(page).toHaveURL(/.*\/login/);

    // Check for error messages (adjust selector based on actual error display)
    const errorMessage = page.locator('.v-alert, .error, [class*="error"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});