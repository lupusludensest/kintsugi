import { BASE_URL } from '../../api_tests/config/urls.js';

export class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigate(path) {
        await this.page.goto(`${BASE_URL}${path}`);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
    }

    async getTitle() {
        return await this.page.title();
    }
}
