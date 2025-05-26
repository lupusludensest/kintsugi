# Test info

- Name: Performance Tests >> should meet performance requirements
- Location: E:\Gurov_SSD_256\IT\Testing\Automation_08_09_2019\kintsugi\performance_tests\lighthouse_test.js:40:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 80
Received:   52
    at test.timeout (E:\Gurov_SSD_256\IT\Testing\Automation_08_09_2019\kintsugi\performance_tests\lighthouse_test.js:60:36)
```

# Test source

```ts
   1 | import lighthouse from 'lighthouse';
   2 | import * as chromeLauncher from 'chrome-launcher';
   3 | import * as fs from 'fs';
   4 | import path from 'path';
   5 | import { fileURLToPath } from 'url';
   6 | import { test, expect } from '@playwright/test';
   7 |
   8 | const __filename = fileURLToPath(import.meta.url);
   9 | const __dirname = path.dirname(__filename);
  10 |
  11 | async function runLighthouse(url, options, config = null) {
  12 |     let chrome = null;
  13 |     const userDataDir = path.join(__dirname, 'chrome-user-data');
  14 |     
  15 |     // Ensure directories exist
  16 |     if (!fs.existsSync(userDataDir)) {
  17 |         fs.mkdirSync(userDataDir, { recursive: true });
  18 |     }
  19 |
  20 |     try {
  21 |         chrome = await chromeLauncher.launch({ 
  22 |             chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  23 |             userDataDir: userDataDir
  24 |         });
  25 |         const results = await lighthouse(url, { ...options, port: chrome.port }, config);
  26 |         return results;
  27 |     } finally {
  28 |         if (chrome) {
  29 |             try {
  30 |                 await chrome.kill();
  31 |             } catch (error) {
  32 |                 console.warn('Warning: Could not kill Chrome instance:', error.message);
  33 |                 // Continue execution even if Chrome cleanup fails
  34 |             }
  35 |         }
  36 |     }
  37 | }
  38 |
  39 | test.describe('Performance Tests', () => {
  40 |     test('should meet performance requirements', async () => {
  41 |         // Set a longer timeout for this specific test
  42 |         test.setTimeout(120000); // 2 minutes
  43 |         
  44 |         const results = await runLighthouse('https://kintsugi.su', {
  45 |             output: 'html',
  46 |             onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  47 |         });
  48 |
  49 |         const scores = Object.entries(results.lhr.categories).reduce((acc, [key, category]) => {
  50 |             acc[key] = category.score * 100;
  51 |             return acc;
  52 |         }, {});
  53 |
  54 |         // Save report
  55 |         const date = new Date().toISOString().replace(/:/g, '_');
  56 |         const reportPath = path.join(__dirname, 'lighthouse_test_results', `web_app_performance_${date}.html`);
  57 |         fs.writeFileSync(reportPath, results.report);
  58 |
  59 |         // Assertions
> 60 |         expect(scores.performance).toBeGreaterThan(80); // Has to be 80
     |                                    ^ Error: expect(received).toBeGreaterThan(expected)
  61 |         expect(scores.accessibility).toBeGreaterThan(90); // Has to be 90
  62 |         expect(scores['best-practices']).toBeGreaterThan(85); // Has to be 85
  63 |         expect(scores.seo).toBeGreaterThan(90); // Has to be 90
  64 |         console.log(`Lighthouse report saved to: ${reportPath}`);
  65 |     }, { timeout: 120000 }); // Also set timeout here as a fallback
  66 | });
  67 |
```