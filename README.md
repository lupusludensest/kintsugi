# Kintsugi Test Automation Suite

This repository contains test automation for the Kintsugi website, including UI, API, performance, and stress tests.

## Project Structure
```
kintsugi/
├── api_tests/         # API tests
├── performance_tests/ # Performance tests using Lighthouse
├── stress_tests/      # Stress and load tests
├── ui_tests/          # UI/End-to-End tests using Playwright
├── playwright.config.js
├── package.json
└── README.md
```

## Test Types

### UI Tests
Located in `ui_tests/` directory, these tests verify the user interface functionality using Playwright.

### API Tests
Located in `api_tests/` directory, these tests verify the backend API endpoints.

### Performance Tests
Located in `performance_tests/` directory, these tests use Lighthouse to measure website performance metrics.

### Stress Tests
Located in `stress_tests/` directory, these tests verify the system's behavior under load.

## Running Tests

To run all tests:
```bash
npx playwright test
