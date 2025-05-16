import { test } from './fixtures/kintsugi.fixture.js';
import { expect } from '@playwright/test';

test.describe('Kintsugi Website Tests', () => {
    test('should display main heading and description', async ({ homePage }) => {
        await homePage.navigateToHome();
        await homePage.verifyMainHeadingVisible();
        const description = await homePage.getMainDescription();
        expect(description).toContain('Комплексное цифровое решение');
    });

    test('should have all navigation links visible', async ({ homePage }) => {
        await homePage.navigateToHome();
        await homePage.verifyNavigationLinksVisible();
    });

    test('should display contact information', async ({ homePage }) => {
        await homePage.navigateToHome();
        await homePage.verifyContactInfoVisible();
    });

    test('should navigate to different sections', async ({ homePage }) => {

        // Navigate to home page
        await homePage.navigateToHome();
        
        // Test navigation to Platform page
        await homePage.navigateToSection('platform');
        await expect(homePage.page).toHaveURL(/.*\/app/);

        // Test navigation to About page
        await homePage.navigateToSection('about');
        await expect(homePage.page).toHaveURL(/.*\/about/);

        // Test navigate to Contacts page
        await homePage.navigateToSection('contacts');
        await expect(homePage.page).toHaveURL(/.*\/contacts/);

        // Test navigate to Legislation page
        await homePage.navigateToSection('legislation');
        await expect(homePage.page).toHaveURL(/.*\/legislation/);

        // Return to home page
        await homePage.navigateToSection('home');
        await expect(homePage.page).toHaveURL(/.*\//);
    });
});
