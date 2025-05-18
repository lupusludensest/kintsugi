import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.js';

export default defineConfig({
  ...baseConfig,
  timeout: 600000, // 10 minutes for entire test
  projects: [
    {
      name: 'chromium',
      use: {
        ...baseConfig.projects.find(p => p.name === 'chromium')?.use,
        timeout: 600000, // 10 minutes for actions
      },
    },
  ],
  workers: 1, // Use only one worker for stress tests
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  retries: 0,  // Don't retry stress tests
  testDir: './stress_tests',  // Only run tests from stress_tests directory
});