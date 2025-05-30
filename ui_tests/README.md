# Kintsugi UI Tests

This directory contains browser-based UI tests for the Kintsugi website using Playwright.

## Structure
```
ui_tests/
├── tests/           # Test specification files
├── pages/          # Page Object Models
├── fixtures/       # Test data and fixtures
└── README.md       # This file
```

## Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)
- Playwright browsers installed (`npx playwright install`)
- Environment variables configured in `.env`

## Running Tests

```bash
# Run all UI tests
npx playwright test ui_tests

# Run a specific UI test file
npx playwright test ui_tests/dashboard.attributes.spec.js

# Run tests with browser visible
npx playwright test ui_tests --headed

# Run on a specific browser
npx playwright test ui_tests --project=chromium

# Debug tests (runs headed, slowed down, with inspector)
npx playwright test ui_tests --debug
```

## Test Structure
- Tests use Page Object Model pattern
- Common utilities are in `utils/` directory
- Shared fixtures in `fixtures/` directory
- Configuration in `playwright.config.js`

## Common Selectors
- Menu items: `.menu-item`
- Buttons: `.v-btn`
- Form inputs: `input[name="fieldname"]`
- Navigation links: `a.router-link-active`

## Viewing Reports
To see the test results and screenshots:
```bash
npx playwright show-report
```


