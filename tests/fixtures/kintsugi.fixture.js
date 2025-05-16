import { test as base } from '@playwright/test';
import { HomePage } from '../pages/homePage.js';
import { PlatformPage } from '../pages/platformPage.js';

export const test = base.extend({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },
    
    platformPage: async ({ page }, use) => {
        const platformPage = new PlatformPage(page);
        await use(platformPage);
    },
});

export { expect } from '@playwright/test';
