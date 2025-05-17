import { test } from "./fixtures/kintsugi.fixture.js";
import { expect } from "@playwright/test";

test.describe("Platform Page Tests", () => {
  test("should load platform page correctly", async ({ platformPage }) => {
    await platformPage.navigateToPlatform();
    await platformPage.verifyPlatformTitleVisible();
  });

  test("should display platform features", async ({ platformPage }) => {
    await platformPage.navigateToPlatform();
    await platformPage.verifyFeaturesVisible();
  });
  
  test("should have accessible documentation links and proper navigation", async ({
    platformPage,
  }) => {
    await platformPage.navigateToPlatform();

    // First verify all three links are present and visible on the page
    await platformPage.verifyDocumentLinksVisible();

    // Test 1: https://kintsugi.su/docs/api.html
    // - Opens in a new tab
    // - Verifies the URL is correct
    // - Closes the new tab
    // - Checks we return to the platform page
    const apiDocsPage = await platformPage.navigateToApiDocs();
    expect(apiDocsPage.url()).toContain("/docs/api.html");
    await apiDocsPage.close();
    await expect(platformPage.page).toHaveURL(/.*\/app/);

    // Test 2: https://kintsugi.su/files/agreement.pdf
    // - Verifies link has target="blank" attribute
    // - Verifies link has correct href="./files/agreement.pdf"
    // - Clicks the link (opens in new tab/downloads based on browser settings)
    // - Checks we stay on the platform page
    await platformPage.navigateToAgreementPdf();
    await expect(platformPage.page).toHaveURL(/.*\/app/);

    // Test 3: https://kintsugi.su/files/policy.pdf
    // - Verifies link has target="blank" attribute
    // - Verifies link has correct href="./files/policy.pdf"
    // - Clicks the link (opens in new tab/downloads based on browser settings)
    // - Checks we stay on the platform page
    await platformPage.navigateToPolicyPdf();
    await expect(platformPage.page).toHaveURL(/.*\/app/);
  });
});
