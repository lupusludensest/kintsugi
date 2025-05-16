import { BasePage } from './basePage.js';
import { expect } from '@playwright/test';

export class PlatformPage extends BasePage {
    constructor(page) {
        super(page);
        this.platformTitle = '.menu-item__content:has-text("Платформа")';
    }

    async navigateToPlatform() {
        await this.navigate('/app');
        await this.waitForPageLoad();
        // Add additional waits for platform page
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
    }

    async verifyPlatformTitleVisible() {
        await expect(this.page.locator(this.platformTitle)).toBeVisible({ timeout: 15000 });
    }

    async verifyFeaturesVisible() {
        // Check for the platform description text which includes feature keywords
        await expect(
            this.page.getByText(/цифровая платформа/i)
        ).toBeVisible({ timeout: 15000 });
    }
}
