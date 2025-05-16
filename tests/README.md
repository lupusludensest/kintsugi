# Kintsugi Website Test Automation

This project contains automated tests for the Kintsugi website (https://kintsugi.su) using Playwright with JavaScript and Page Object Pattern.

## Project Structure

```
kintsugi/
├── tests/
│   ├── fixtures/        # Test fixtures
│   │   └── kintsugi.fixture.js
│   ├── pages/          # Page Object classes
│   │   ├── basePage.js
│   │   ├── homePage.js
│   │   └── platformPage.js
│   ├── home.spec.js    # Home page tests
│   ├── platform.spec.js # Platform page tests
│   └── README.md       # Test documentation
├── test-results/       # Test execution results
├── playwright-report/  # HTML test reports
├── performance_lighthouse/ # Performance test results
├── .gitignore         # Git ignore rules
├── package.json       # Project configuration
└── playwright.config.js # Playwright configuration
```

## Test Coverage

### Home Page Tests (`home.spec.js`)
- Main heading and description visibility
- Navigation links presence and functionality
- Contact information display
- Section navigation

### Platform Page Tests (`platform.spec.js`)
- Platform features visibility
- Documentation links accessibility:
  - API Documentation (`/docs/api.html`)
  - User Agreement (`./files/agreement.pdf`)
  - Privacy Policy (`./files/policy.pdf`)
- Navigation between sections
- PDF document handling

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
  npx playwright test
  ```

- Run tests with UI mode:
  ```bash
  npx playwright test --ui
  ```

- Run specific test file:
  ```bash
  npx playwright test platform.spec.js
  ```

- Run tests in debug mode:
  ```bash
  npx playwright test --debug
  ```

## Page Objects

### BasePage
- Common functionality for all pages
- Navigation methods
- Wait utilities
- Basic assertions

### HomePage
- Main page interactions
- Navigation menu handling
- Contact information verification

### PlatformPage
- Platform-specific features verification
- Document links handling
- PDF and HTML document navigation
- Link attribute verification

## Best Practices Implemented

1. **Link Verification**
   - Checks both visibility and href attributes
   - Handles relative paths correctly
   - Separate handling for HTML and PDF links

2. **Timeouts and Waits**
   - Appropriate timeout values for different operations
   - Page load state handling
   - Network idle checks when needed

3. **Error Handling**
   - Descriptive error messages
   - Proper timeout configurations
   - Screenshot capture on failure

4. **Clean Code**
   - Page Object Pattern
   - DRY (Don't Repeat Yourself) principle
   - Clear method naming
   - Comprehensive comments

## Maintenance

- Tests are designed to be maintainable and scalable
- Selectors use reliable attributes
- Common functionality is abstracted to base classes
- Configuration is externalized
- Git ignores appropriate files and directories
