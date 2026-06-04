import { BASE_URL } from '../../api_tests/config/urls.js'; 

export class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigate(path) {
        let lastError;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                await this.page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                return true;
            } catch (err) {
                lastError = err;
                console.error(`[BasePage.navigate] Attempt ${attempt} failed:`, err.message);
                await this.page.screenshot({ path: `navigate-failed-attempt-${attempt}.png`, fullPage: true });
                if (attempt === 2) {
                    throw new Error(`Navigation to ${BASE_URL}${path} failed after 2 attempts: ${err.message}`);
                }
                await this.page.reload({ waitUntil: 'domcontentloaded' });
            }
        }
        return false;
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
    }

    async getTitle() {
        return await this.page.title();
    }
}
