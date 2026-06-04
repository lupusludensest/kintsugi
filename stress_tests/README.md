# Kintsugi Stress Tests

This directory contains stress tests for evaluating the Kintsugi website's performance under load.

## Structure
```
stress_tests/
├── load_test.spec.js    # Main stress test implementation
├── results/             # Test result reports
└── README.md           # This file
```

## Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)
- Environment variables configured in `.env`
- Adequate system resources for load testing

## Running Tests

```bash
# Run stress tests with longer timeout (recommended)
npx playwright test stress_tests/load_test.spec.js --config=playwright.stress.config.js

# Run with standard configuration (may timeout with higher loads)
npx playwright test stress_tests/load_test.spec.js

# Run with visible browser
npx playwright test stress_tests/load_test.spec.js --headed --config=playwright.stress.config.js

# Run with debug mode
npx playwright test stress_tests/load_test.spec.js --debug --config=playwright.stress.config.js
```

## Configuration
- Load test parameters in `playwright.stress.config.js`
- Environment variables in `.env`
- Default timeouts can be adjusted per run

## Test Scenarios
- Multi-endpoint stress testing
- Emergency response testing
- Concurrent user simulation
- Resource usage monitoring

## Viewing Reports
Reports are generated in the `results/` directory:
- HTML reports for visual analysis
- JSON reports for programmatic processing
- Each run creates a timestamped report file

## Performance Metrics
The tests measure:
- Response times
- Error rates
- Concurrent user limits
- Resource utilization

