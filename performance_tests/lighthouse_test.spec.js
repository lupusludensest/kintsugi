import dotenv from 'dotenv';
dotenv.config();
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLighthouse(url, options, config = null) {
    let chrome = null;
    const userDataDir = path.join(__dirname, 'chrome-user-data');
    
    // Ensure directories exist
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    try {
        chrome = await chromeLauncher.launch({ 
            chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
            userDataDir: userDataDir
        });
        const results = await lighthouse(url, { ...options, port: chrome.port }, config);
        return results;
    } finally {
        if (chrome) {
            try {
                await chrome.kill();
            } catch (error) {
                console.warn('Warning: Could not kill Chrome instance:', error.message);
                // Continue execution even if Chrome cleanup fails
            }
        }
    }
}

test.describe('Performance Tests', () => {
    test('should meet performance requirements', {tag: '@performance_lighthouse'}, async () => {
        // Set a longer timeout for this specific test
        test.setTimeout(120000); // 2 minutes

        const baseUrl = process.env.KINTSUGI_BASE_URL || "https://kintsugi.su";
        const results = await runLighthouse(baseUrl, {
            output: ['html', 'json'],
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
        });

        const scores = Object.entries(results.lhr.categories).reduce((acc, [key, category]) => {
            acc[key] = category.score * 100;
            return acc;
        }, {});

        // Save report
        const date = new Date().toISOString().replace(/:/g, '_');
        const resultsDir = path.join(__dirname, 'lighthouse_test_results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        const htmlReportPath = path.join(resultsDir, `web_app_performance_${date}.html`);
        const jsonReportPath = path.join(resultsDir, `web_app_performance_${date}.json`);
        fs.writeFileSync(htmlReportPath, results.report[0]);
        fs.writeFileSync(jsonReportPath, results.report[1]);
        console.log(`Lighthouse HTML report saved to: ${htmlReportPath}`);
        console.log(`Lighthouse JSON report saved to: ${jsonReportPath}`);

        // Assertions
        try {
            expect(scores.performance).toBeGreaterThan(80); // Has to be 80
            expect(scores.accessibility).toBeGreaterThan(90); // Has to be 90
            expect(scores['best-practices']).toBeGreaterThan(85); // Has to be 85
            expect(scores.seo).toBeGreaterThan(90); // Has to be 90
        } catch (error) {
            console.error('\n\x1b[31m[WARNING] Lighthouse performance test failed!\x1b[0m');
            console.error('Performance:', scores.performance);
            console.error('Accessibility:', scores.accessibility);
            console.error('Best Practices:', scores['best-practices']);
            console.error('SEO:', scores.seo);
            console.error('Required thresholds: Performance > 80, Accessibility > 90, Best Practices > 85, SEO > 90');
            throw error;
        }
    }, { timeout: 120000 }); // Also set timeout here as a fallback
});