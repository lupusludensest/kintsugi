# Kintsugi Performance Tests

This directory contains performance tests and analysis for the Kintsugi website using Lighthouse.

## Structure
```
performance_tests/
├── lighthouse_test.spec.js      # Performance test implementation
├── lighthouse_test_results/     # Test reports (HTML & JSON)
├── chrome-user-data/            # Chrome profile data
└── README.md                    # This file
```

## Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)
- Chrome browser installed
- Environment variables configured in `.env`

## Running Tests

```bash
# Run performance tests
npx playwright test performance_tests/lighthouse_test.spec.js

# Run with increased timeout (recommended)
npx playwright test performance_tests/lighthouse_test.spec.js --timeout=120000

# Run specific performance metrics only
npx playwright test performance_tests/lighthouse_test.spec.js --grep="@performance"
```

## Configuration
- Performance thresholds are configured in the test file
- Chrome settings can be adjusted in the test configuration
- Test timeouts can be modified in `playwright.config.js`

## Viewing Reports
To view the latest performance test report:
1. Navigate to `lighthouse_test_results/` directory
2. Open the most recent HTML file in your browser
3. JSON reports are also available for programmatic analysis

## Performance Metrics
The tests measure:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
