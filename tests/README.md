# Kintsugi Website Test Automation

This project contains automated tests for the Kintsugi website (https://kintsugi.su) using Playwright with JavaScript and Page Object Pattern.

## Project Structure

```
kintsugi/
├── tests/
│   ├── backup/          # Backup files
│   ├── fixtures/        # Test fixtures
│   ├── pages/          # Page Object classes
│   ├── utils/          # Utility functions and configurations
│   ├── home.spec.js    # Home page tests
│   ├── platform.spec.js # Platform page tests
│   └── README.md       # Test documentation
├── package.json        # Project configuration
├── package-lock.json   # NPM dependencies lock file
├── playwright.config.js # Playwright configuration
└── README.md          # Project documentation
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- Run all tests:
  ```bash
  npm test
  ```

- Run tests with UI mode:
  ```bash
  npm run test:ui
  ```

- Run tests in headed mode:
  ```bash
  npm run test:headed
  ```

- View test report:
  ```bash
  npm run show-report
  ```

## Test Structure

- Uses Page Object Pattern for better maintainability
- Implements custom fixtures for common setup
- Includes utility functions for common operations
- Optimized for Chromium browser testing
- Generates HTML reports

## Best Practices

- Each page has its own Page Object class
- Base Page class for common functionality
- Clear and maintainable selectors
- Async/await for all operations
- Proper error handling and timeouts
- Screenshot capture on failure
- Network idle waiting
- Proper page load checks
- JSDoc documentation for methods
