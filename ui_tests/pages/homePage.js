import { BasePage } from './basePage.js';
import { expect } from '@playwright/test';

export class HomePage extends BasePage {
    constructor(page) {
        super(page);
        this.mainHeading = '.full-logo--title';
        this.mainDescription = 'text=Комплексное цифровое решение';
        this.navigationLinks = {
            home: 'text=Главная',
            platform: 'text=Платформа',
            about: 'text=О нас',
            contacts: 'text=Контакты',
            legislation: 'text=Регулирование'
        };
        this.contactInfo = {
            generalEmail: 'text=info@kintsugi.su',
            technicalEmail: 'text=tp@kintsugi.su'
        };
    }

    async navigateToHome() {
        await this.navigate('/');
        await this.waitForPageLoad();
    }

    async verifyMainHeadingVisible() {
        await expect(this.page.locator(this.mainHeading)).toBeVisible();
    }

    async getMainDescription() {
        return await this.page.locator(this.mainDescription).textContent();
    }

    async navigateToSection(section) {
        await this.page.click(this.navigationLinks[section]);
        await this.waitForPageLoad();
    }

    async verifyNavigationLinksVisible() {
        for (const link of Object.values(this.navigationLinks)) {
            await expect(this.page.locator(link)).toBeVisible();
        }
    }

    async verifyContactInfoVisible() {
        await expect(this.page.locator(this.contactInfo.generalEmail)).toBeVisible();
        await expect(this.page.locator(this.contactInfo.technicalEmail)).toBeVisible();
    }
}
