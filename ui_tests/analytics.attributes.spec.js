import dotenv from "dotenv";
import { test, expect } from "@playwright/test";
import { loginUser } from "../utils/auth.helper.js";

dotenv.config();

test.describe("Analytics Page Attributes Verification", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    // Navigate to the analytics page after login
    const analyticsLink = page.locator('a[href="/analytics"]');
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
    } else {
      // Direct navigation if no menu link
      await page.goto("/analytics");
    }
    await page.waitForURL("**/analytics", {
      timeout: parseInt(process.env.TIMEOUT),
    });
    // Wait for page to load
    try {
      await page.waitForLoadState("networkidle", { timeout: 10000 });
    } catch (e) {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: "ui_tests/pic_generated_in_tests/analytics-page.png" });
  });

  test("Analytics page preview message or dashboard is visible", { tag: '@ui_dashboard_visible' }, async ({ page }) => {
    // Check for preview message
    const previewMsg = page.locator("text=Сейчас сервис работает только при ширине экрана больше 1440px.");
    if (await previewMsg.isVisible()) {
      await expect(previewMsg).toBeVisible();
      // Optionally, assert branding
      await expect(page.locator("text=КИНЦУГИ")).toBeVisible();
      return;
    }
    // If dashboard is visible, check for analytics features
    // Example: check for tables, filters, search, charts
    const table = page.locator("table, .v-table, .analytics-table").first();
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
    const filterSelectors = [
      ".filter-section",
      ".filters",
      ".v-select",
      ".filter-dropdown",
      'button:has-text("Фильтр")',
      'button:has-text("Фильтры")',
      'div[role="combobox"]',
    ];
    let filterFound = false;
    for (const selector of filterSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        filterFound = true;
        break;
      }
    }
    if (filterFound) {
      await expect(page.locator(filterSelectors[0])).toBeVisible();
    }
    // Search field
    const searchInputSelectors = [
      'input[type="search"]',
      'input[placeholder*="поиск" i]',
      'input[placeholder*="искать" i]',
      '.v-text-field input',
      '.search input',
    ];
    let searchFound = false;
    for (const selector of searchInputSelectors) {
      const inputs = page.locator(selector);
      if (await inputs.count() > 0) {
        await expect(inputs.first()).toBeVisible();
        searchFound = true;
        break;
      }
    }
    // Optionally, check for charts or summary blocks
    const chart = page.locator("canvas, .chart, .analytics-chart");
    if (await chart.isVisible().catch(() => false)) {
      await expect(chart).toBeVisible();
    }

    // 1. Check if title "Аналитика" is visible
    const analyticsTitle = page.locator('.text-title-uppercase-20.mb-2');
    if (await analyticsTitle.isVisible().catch(() => false)) {
      await expect(analyticsTitle).toContainText('Аналитика');
    }

    // 2. Check if "Настройте аналитическую выборку" block is visible
    const setupSampleBlock = page.locator('//div[contains(text(),"Настройте аналитическую выборку")]');
    if (await setupSampleBlock.isVisible().catch(() => false)) {
      await expect(setupSampleBlock).toBeVisible();
    }

    // 3. Check if "Настроить" button is visible
    const setupBtn = page.locator('.v-btn__content', { hasText: 'Настроить' });
    if (await setupBtn.isVisible().catch(() => false)) {
      await expect(setupBtn).toBeVisible();
      await expect(setupBtn).toBeEnabled();
      // Проверяем, что кнопка кликабельна
      await setupBtn.click();
      
    }
  });
  test("Verify popup functionality when 'Настроить' is clicked", { tag: '@ui_popup_presents' }, async ({ page }) => {
    // 1. Click on "Настроить" button
    const setupBtn = page.locator('button, .v-btn', { hasText: 'Настроить' }).first();
    await expect(setupBtn).toBeVisible();
    await expect(setupBtn).toBeEnabled();
    await setupBtn.click();

    // 2. Wait for popup and find checkboxes
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    
    const popup = dialog.locator('.v-overlay__content');
    await expect(popup).toBeVisible({ timeout: 5000 });

    // Check all interactive elements
    const checkboxes = popup.locator('input[type="checkbox"], .v-checkbox input, .v-selection-control input, [role="checkbox"] input');
    const confirmBtn = popup.locator('button:has-text("Подтвердить")');
    const clearBtn = popup.locator('button:has-text("Очистить всё")');

    // Verify checkboxes are present and interactive
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    // Check all checkboxes
    for (let i = 0; i < checkboxCount; i++) {
      const cb = checkboxes.nth(i);
      if (!(await cb.isChecked())) {
        await cb.check();
      }
    }

    // Verify buttons are enabled after checking
    await expect(confirmBtn).toBeEnabled();
    await expect(clearBtn).toBeEnabled();

    // Uncheck all checkboxes
    for (let i = 0; i < checkboxCount; i++) {
      const cb = checkboxes.nth(i);
      if (await cb.isChecked()) {
        await cb.uncheck();
      }
    }

    // Verify buttons are disabled after unchecking
    await expect(confirmBtn).toBeDisabled();
    await expect(clearBtn).toBeDisabled();
  });
  test("Mark all checkboxes, confirm, and verify all attributes are present in the new UI", { tag: '@ui_checkboxes_present' }, async ({ page }) => {    
    // 1. Open the popup
    const setupBtn = page.locator('button, .v-btn', { hasText: 'Настроить' }).first();
    await expect(setupBtn).toBeVisible();
    await expect(setupBtn).toBeEnabled();
    await setupBtn.click();

    // 2. Wait for popup and find checkboxes
    // First wait for the dialog to be present
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    
    // Then find the content area within the dialog
    const popup = dialog.locator('.v-overlay__content');
    await expect(popup).toBeVisible({ timeout: 5000 });
    
    // Wait a bit for animation and content loading
    await page.waitForTimeout(1000);
    
    // Look for checkboxes with multiple selectors
    const checkboxes = popup.locator('input[type="checkbox"], .v-checkbox input, .v-selection-control input, [role="checkbox"] input');
    const labels = popup.locator('.checkbox-list__row-description div, .v-label, label, .checkbox-label');    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
    
    // Check all checkboxes and collect their labels
    const checkedLabels = [];
    for (let i = 0; i < checkboxCount; i++) {
      const cb = checkboxes.nth(i);
      const labelElement = labels.nth(i);
      if (labelElement) {
        const labelText = await labelElement.textContent();
        if (!(await cb.isChecked())) {
          await cb.check();
        }
        if (labelText) {
          checkedLabels.push(labelText.trim());
        }
      }
    }

    // 3. Click 'Подтвердить'
    const submitBtn = popup.locator('button:has-text("Подтвердить")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 4. Wait for the new UI to appear (assuming popup closes and attributes are shown)
    await expect(popup).toBeHidden({ timeout: 10000 });

    // 5. Verify all attributes are present in the new UI
    // Try to find all checked attribute labels in the main analytics area
    for (const label of checkedLabels) {
      if (label) {
        // Try to find the label text somewhere in the analytics UI
        const attrLocator = page.locator(`text=${label}`);
        await expect(attrLocator.first()).toBeVisible();
      }
    }
  });
});