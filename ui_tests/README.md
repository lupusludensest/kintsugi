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

## Attribute Tests
The framework includes comprehensive attribute tests for all main UI pages:

### Core Pages
- `analytics.attributes.spec.js` - Analytics page attribute verification
- `dashboard.attributes.spec.js` - Dashboard menu and navigation verification
- `partners.attributes.spec.js` - Partners list and management verification

### Transaction Pages
- `contracts.attributes.spec.js` - Contract management and details verification
- `bordereaux.attributes.spec.js` - Bordereaux list and processing verification
- `risks.attributes.spec.js` - Risk assessment and tracking verification
- `losses.attributes.spec.js` - Loss recording and claims verification

Each attribute test file follows a consistent structure:
- Pre-test authentication and navigation
- Element presence and visibility checks
- Interactive element functionality verification
- Data display and formatting validation
- Error handling and edge cases
- Navigation and state management

Best practices implemented across all attribute tests:
- Robust selectors with multiple fallbacks
- Comprehensive error logging
- Screenshot capture for debugging
- Flexible timeout handling
- Proper test isolation

## Viewing Reports
To see the test results and screenshots:
```bash
npx playwright show-report
```


