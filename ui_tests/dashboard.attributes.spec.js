import dotenv from "dotenv";
import { test, expect } from "@playwright/test";

// Load environment variables from .env file
dotenv.config();

test.describe("Dashboard Attributes Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport wider than 1440px requirement
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Login using correct Kintsugi selectors
    await page.goto(process.env.KINTSUGI_LOGIN_URL);
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="email"]', process.env.KINTSUGI_LOGIN);
    await page.fill('input[name="password"]', process.env.KINTSUGI_PASSWORD);

    const submitButton = page.locator('button:has-text("Войти")');

    await Promise.all([
      page.waitForURL("**/dashboard", { timeout: parseInt(process.env.TIMEOUT)}),
      submitButton.click(),
    ]);

    await page.waitForLoadState("networkidle");
  });

  test("Clickable Dashboard Menu Item is present", async ({ page }) => {
    // Check for the active dashboard menu item using exact structure from HTML
    const activeMenuLink = page.locator(
      "a.router-link-active.router-link-exact-active.menu-item.menu-item--active"
    );
    await expect(activeMenuLink).toBeVisible();

    // Check for the menu item content div
    const menuItemContent = page.locator(
      "a.router-link-active.router-link-exact-active.menu-item.menu-item--active .menu-item__content"
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the nested div with text "Дашборд"
    const dashboardText = page.locator(
      'a.router-link-active.router-link-exact-active.menu-item.menu-item--active .menu-item__content div:has-text("Дашборд")'
    );
    await expect(dashboardText).toBeVisible();
  });

  test("Clickable Partners Menu Item is present", async ({ page }) => {
    // Check for Partners menu item (not active, so different selector)
    const partnersMenuLink = page.locator('a[href="/partners"].menu-item');
    await expect(partnersMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/partners"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Партнеры" - use first() to avoid the "2 elements" error
    const partnersText = page
      .locator(
        'a[href="/partners"].menu-item .menu-item__content div:has-text("Партнеры")'
      )
      .first();
    await expect(partnersText).toBeVisible();

    // Check for the counter div separately
    const counterDiv = page.locator(
      'a[href="/partners"].menu-item .menu-item__content .counter'
    );
    await expect(counterDiv).toBeVisible();
    await expect(counterDiv).toHaveText("10");
  });

  test("Clickable Users Menu Item is present", async ({ page }) => {
    // Check for Users menu item
    const usersMenuLink = page.locator('a[href="/users"].menu-item');
    await expect(usersMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/users"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Пользователи"
    const usersText = page
      .locator(
        'a[href="/users"].menu-item .menu-item__content div:has-text("Пользователи")'
      )
      .first();
    await expect(usersText).toBeVisible();

    // Check for the counter div
    const counterDiv = page.locator(
      'a[href="/users"].menu-item .menu-item__content .counter'
    );
    await expect(counterDiv).toBeVisible();
    await expect(counterDiv).toHaveText("13 • 15");
  });

  test("Clickable Analytics Menu Item is present", async ({ page }) => {
    // Check for Analytics menu item
    const analyticsMenuLink = page.locator('a[href="/analytics"].menu-item');
    await expect(analyticsMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/analytics"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Аналитика"
    const analyticsText = page
      .locator(
        'a[href="/analytics"].menu-item .menu-item__content div:has-text("Аналитика")'
      )
      .first();
    await expect(analyticsText).toBeVisible();
  });

  test("Clickable Contracts Menu Item is present", async ({ page }) => {
    // Check for Contracts menu item
    const contractsMenuLink = page.locator('a[href="/contracts"].menu-item');
    await expect(contractsMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/contracts"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Договоры"
    const contractsText = page
      .locator(
        'a[href="/contracts"].menu-item .menu-item__content div:has-text("Договоры")'
      )
      .first();
    await expect(contractsText).toBeVisible();

    // Check for the counter div
    const counterDiv = page.locator(
      'a[href="/contracts"].menu-item .menu-item__content .counter'
    );
    await expect(counterDiv).toBeVisible();
    await expect(counterDiv).toHaveText("1");
  });

  test("Clickable Risks Menu Item is present", async ({ page }) => {
    // Check for Risks menu item
    const risksMenuLink = page.locator('a[href="/risks"].menu-item');
    await expect(risksMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/risks"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Риски"
    const risksText = page
      .locator(
        'a[href="/risks"].menu-item .menu-item__content div:has-text("Риски")'
      )
      .first();
    await expect(risksText).toBeVisible();

    // Check for the counter div
    const counterDiv = page.locator(
      'a[href="/risks"].menu-item .menu-item__content .counter'
    );
    await expect(counterDiv).toBeVisible();
    await expect(counterDiv).toHaveText("1580");
  });

  test("Clickable Losses Menu Item is present", async ({ page }) => {
    // Check for Losses menu item
    const lossesMenuLink = page.locator('a[href="/losses"].menu-item');
    await expect(lossesMenuLink).toBeVisible();

    // Check for the menu item content
    const menuItemContent = page.locator(
      'a[href="/losses"].menu-item .menu-item__content'
    );
    await expect(menuItemContent).toBeVisible();

    // Check for the text "Убытки"
    const lossesText = page
      .locator(
        'a[href="/losses"].menu-item .menu-item__content div:has-text("Убытки")'
      )
      .first();
    await expect(lossesText).toBeVisible();

    // Check for the counter div
    const counterDiv = page.locator(
      'a[href="/losses"].menu-item .menu-item__content .counter'
    );
    await expect(counterDiv).toBeVisible();
    await expect(counterDiv).toHaveText("0");
  });

  test("User can logout successfully", async ({ page }) => {
    // Click on profile dropdown icon
    const profileDropdown = page.locator(
      'div[class="profile-dropdown--icon v-btn--variant-text"] svg'
    );
    await expect(profileDropdown).toBeVisible();
    await profileDropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(1000);

    // Click on logout option (negative text style)
    const logoutButton = page.locator(".v-label--clickable.text-negative");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Verify redirect to login page
    await page.waitForURL("**/login", { timeout: parseInt(process.env.TIMEOUT) });
    await expect(page).toHaveURL(process.env.KINTSUGI_LOGIN_URL);
  });
});
