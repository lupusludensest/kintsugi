import { test } from "../ui_tests/fixtures/kintsugi.fixture.js";
import { expect } from "@playwright/test";

test.describe("Kintsugi Website Tests", () => {
  test("should display main heading and description", async ({ homePage }) => {
    await homePage.navigateToHome();
    await homePage.verifyMainHeadingVisible();
    const description = await homePage.getMainDescription();
    expect(description).toContain("Комплексное цифровое решение");
  });

  test("should have all navigation links visible", async ({ homePage }) => {
    await homePage.navigateToHome();
    await homePage.verifyNavigationLinksVisible();
  });

  test("should display contact information", async ({ homePage }) => {
    await homePage.navigateToHome();
    await homePage.verifyContactInfoVisible();
  });

  test("should navigate to different sections", async ({ homePage }) => {
    // Navigate to home page
    await homePage.navigateToHome();

    // Test navigation to Platform page
    await homePage.navigateToSection("platform");
    await expect(homePage.page).toHaveURL(/.*\/app/);

    // Test navigation to About page
    await homePage.navigateToSection("about");
    await expect(homePage.page).toHaveURL(/.*\/about/);

    // Test navigate to Contacts page
    await homePage.navigateToSection("contacts");
    await expect(homePage.page).toHaveURL(/.*\/contacts/);

    // Test navigate to Legislation page
    await homePage.navigateToSection("legislation");
    await expect(homePage.page).toHaveURL(/.*\/legislation/);

    // Return to home page
    await homePage.navigateToSection("home");
    await expect(homePage.page).toHaveURL(/.*\//);
  });

  test("should toggle specific images using the data-testid toggle button", async ({
    homePage,
  }) => {
    // Navigate to home page
    await homePage.navigateToHome();

    // Check that specific images are visible by default
    await expect(
      homePage.page.locator("img[src='/images/logo.svg']")
    ).toBeVisible();
    await expect(
      homePage.page.locator("img[src='/images/sk.png']")
    ).toBeVisible();

    // Check if element with class text-link has the correct text
    await expect(homePage.page.locator(".text-link")).toContainText(
      "Отключить изображения на сайте"
    );

    // Click the "Отключить изображения на сайте" button
    await homePage.page.locator(".text-link").click();

    // Check if element with class text-link has the correct text
    await expect(homePage.page.locator(".text-link")).toContainText(
      "Включить изображения на сайте"
    );

    // Check that specific images are now hidden
    await expect(
      homePage.page.locator("img[src='/images/logo.svg']")
    ).toBeVisible(false);
    await expect(
      homePage.page.locator("img[src='/images/sk.png']")
    ).toBeVisible(false);

    // Click the "Включить изображения на сайте" button to turn images back on
    await homePage.page.locator(".text-link").click();

    // Verify specific images are visible again
    await expect(
      homePage.page.locator("img[src='/images/logo.svg']")
    ).toBeVisible();
    await expect(
      homePage.page.locator("img[src='/images/sk.png']")
    ).toBeVisible();

    // Verify button text changed back to "Отключить изображения на сайте"
    await expect(homePage.page.locator(".text-link")).toContainText(
      "Отключить изображения на сайте"
    );
  });
});
