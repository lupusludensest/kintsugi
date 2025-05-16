import { test } from './fixtures/kintsugi.fixture.js';
import { expect } from '@playwright/test';

test.describe('Platform Page Tests', () => {
    test('should load platform page correctly', async ({ platformPage }) => {
        await platformPage.navigateToPlatform();
        await platformPage.verifyPlatformTitleVisible();
    });

    test('should display platform features', async ({ platformPage }) => {
        await platformPage.navigateToPlatform();
        await platformPage.verifyFeaturesVisible();
    });    test('should have accessible documentation links and proper navigation', async ({ platformPage }) => {
        await platformPage.navigateToPlatform();
        
        // Test API docs navigation in new tab
        const apiDocsPage = await platformPage.navigateToApiDocs();
        expect(apiDocsPage.url()).toContain('/docs/api.html');
        await apiDocsPage.close();
        await expect(platformPage.page).toHaveURL(/.*\/app/);

        // Verify PDF links have correct attributes
        await platformPage.verifyAgreementLink();
        await platformPage.verifyPolicyLink();
    });
});
