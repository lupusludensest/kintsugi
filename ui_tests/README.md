# Kintsugi UI Tests

This directory contains UI tests for the Kintsugi website using Playwright.

## Running Tests

```bash
# Run all UI tests
npx playwright test ui_tests

# Run a specific UI test file
npx playwright test ui_tests/example.spec.js

# Run tests with browser visible
npx playwright test ui_tests --headed

# Run on a specific browser
npx playwright test ui_tests --project=chromium

# Debug tests (runs headed, slowed down, with inspector)
npx playwright test ui_tests --debug

# After running tests, view the HTML report:
npx playwright show-report
```


