# Kintsugi Stress Tests

This directory contains stress tests for the Kintsugi website to evaluate performance under load.

## Running Tests

```bash
# Run stress tests
npx playwright test stress_tests/load_test.spec.js

# Run with visible browser
npx playwright test stress_tests/load_test.spec.js --headed

# Run with debug mode
npx playwright test stress_tests/load_test.spec.js --debug
```

## Viewing Reports
```
# To see a stress test report, go to:
E:\Gurov_SSD_256\IT\Testing\Automation_08_09_2019\kintsugi\stress_tests\results
and click on the latest HTML file to open it in your browser.
```
