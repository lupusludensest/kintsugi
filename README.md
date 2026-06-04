# Kintsugi Test Framework

## Framework Structure
```
kintsugi/
├── api_tests/                    # API endpoint tests
│   ├── config
│   ├── tests/
│   └── README.md
├── performance_tests/            # Lighthouse performance tests
│   ├── tests/
│   ├── lighthouse_test_results/
│   └── README.md
├── stress_tests/                 # Load and stress testing
│   ├── tests/
│   ├── results/
│   └── README.md
├── ui_tests/                     # Browser-based UI tests
│   ├── tests/
│   ├── pages/
│   ├── fixtures/
│   └── README.md
├── utils/                        # Shared utilities
├── playwright.config.js          # Main configuration
├── playwright.stress.config.js   # Stress test configuration
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
npx playwright test api_tests/
npx playwright test performance_tests
npx playwright test stress_tests
npx playwright test ui_tests/

# Run all test suites one after another
npx playwright test api_tests/ && npx playwright test ui_tests/ && npm run performance-test && npm run stress-test
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
