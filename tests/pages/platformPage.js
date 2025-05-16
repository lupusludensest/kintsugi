import { BasePage } from './basePage.js';
import { expect } from '@playwright/test';

export class PlatformPage extends BasePage {    constructor(page) {
        super(page);
        this.platformTitle = '.menu-item__content:has-text("Платформа")';
        this.apiDocsLink = 'a[href*="docs/api.html"]';
        this.agreementLink = 'a[href*="files/agreement.pdf"]';
        this.policyLink = 'a[href*="files/policy.pdf"]';
    }    async navigateToPlatform() {
        await this.navigate('/app');
        // Only wait for domcontentloaded as it's more reliable
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    }

    async verifyPlatformTitleVisible() {
        await expect(this.page.locator(this.platformTitle)).toBeVisible({ timeout: 30000 });
    }

    async verifyFeaturesVisible() {
        // Check for the platform description text which includes feature keywords
        await expect(
            this.page.getByText(/цифровая платформа/i)
        ).toBeVisible({ timeout: 30000 });
    }

    async verifyDocumentLinksVisible() {
        await expect(this.page.locator(this.apiDocsLink)).toBeVisible();
        await expect(this.page.locator(this.agreementLink)).toBeVisible();
        await expect(this.page.locator(this.policyLink)).toBeVisible();
    }    async waitForDownload(clickAction) {
        const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
        await clickAction();
        const download = await downloadPromise;
        return download.url();
    }    async navigateToApiDocs() {
        const [newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.page.click(this.apiDocsLink)
        ]);
        // Wait for HTML page to load
        await expect(newPage).toHaveURL('https://kintsugi.su/docs/api.html', { timeout: 30000 });
        return newPage;
    }    async verifyAgreementLink() {
        // For PDFs, just verify the link attributes
        const link = this.page.locator(this.agreementLink);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', './files/agreement.pdf');
        return this.page;
    }

    async verifyPolicyLink() {
        // For PDFs, just verify the link attributes
        const link = this.page.locator(this.policyLink);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', './files/policy.pdf');
        return this.page;
    }
}
