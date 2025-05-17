// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://kintsugi.su';

test.describe('Kintsugi API Tests', () => {
  test('basic GET request to homepage', async ({ request }) => {
    // Make GET request
    const response = await request.get(BASE_URL + '/');
    
    // Status code assertion
    await expect(response.status()).toBe(200);    // Content verification
    const body = await response.text();
    expect(body).toContain('<title>Кинцуги | Страхование </title>');
      // URL verification
    expect(response.url()).toBe(BASE_URL + '/');
    
    // Headers check
    const headers = response.headers();
    expect(headers['content-type']).toContain('text/html'); // Check for HTML content type
  });
});
