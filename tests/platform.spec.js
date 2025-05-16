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
    });
});
