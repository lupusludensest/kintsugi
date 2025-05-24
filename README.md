# Kintsugi Test Framework

## Framework Structure
```
kintsugi/
├── api_tests/
│   ├── tests/
│   ├── helpers/
│   └── README.md
├── performance_tests/
│   ├── tests/
│   ├── lighthouse_test_results/
│   └── README.md
├── playwright-report/
│   ├── index.html
│   └── data/
├── ui_tests/
│   ├── tests/
│   ├── pages/
│   ├── fixtures/
│   └── README.md
├── playwright.config.js
├── package.json
└── README.md
```

## Test Types
- API Tests (`api_tests/`)
- Performance Tests (`performance_tests/`)
- UI Tests (`ui_tests/`)

## Configuration
```bash
npm install
npx playwright install
```

## Running Tests
```bash
# Run all tests
npx playwright test

# Run specific test type
npx playwright test api_tests
npx playwright test performance_tests
npx playwright test ui_tests
```

## Viewing Reports
```bash
# API and UI Tests
npx playwright show-report

# Performance Tests
start performance_tests/lighthouse_test_results/report.html
```

## Integration Manual
For detailed API integration instructions, please refer to our [Integration Documentation](https://kintsugi.su/docs/api.html).

## Common Issues & Troubleshooting
1. Timeout errors
   ```bash
   # Increase timeout in playwright.config.js
   timeout: 60000  // 60 seconds
   ```
2. Browser launch failures
   ```bash
   npx playwright install chromium
   ```
