# Kintsugi API Tests

This directory contains API tests for the Kintsugi website endpoints and services.

## Structure
```
api_tests/
├── tests/           # Test files
├── helpers/         # Support functions and utilities
└── README.md       # This file
```

## Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)
- Environment variables configured in `.env`

## Running Tests

```bash
# Run all API tests
npx playwright test api_tests

# Run specific test file
npx playwright test api_tests/login.api.spec.js

# Run with debug mode
npx playwright test api_tests --debug
```

## Configuration
- Tests use environment variables from `.env` file
- Default timeouts can be adjusted in `playwright.config.js`
- API endpoints are configured in `api_tests/config/urls.js`

## Viewing Reports
To see the API test report:
```bash
npx playwright show-report
```
Then open the generated report in your browser.
