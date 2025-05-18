// @ts-check
import test from '@playwright/test';
import { BASE_URL, ENDPOINTS, URLS, URL_PATTERNS, CONTENT_TYPES } from './config/urls.js';

test.describe('Kintsugi API Tests', () => {
  test('basic GET request to homepage', async ({ request }) => {
    // Make GET request
    const response = await request.get(URLS.HOME);
    
    // Status code assertion
    await test.expect(response.status()).toBe(200);
    
    // Content verification
    const body = await response.text();
    test.expect(body).toContain('<title>Кинцуги | Страхование </title>');
    
    // URL verification
    test.expect(response.url()).toBe(URLS.HOME);
    
    // Headers check
    const headers = response.headers();
    test.expect(headers['content-type']).toContain(CONTENT_TYPES.HTML);
    
    // Verify URL pattern
    test.expect(URL_PATTERNS.HTML_PAGES.test(response.url())).toBeTruthy();
  });

  // Test for all HTML pages
  for (const endpoint of [ENDPOINTS.APP, ENDPOINTS.ABOUT, ENDPOINTS.CONTACTS, ENDPOINTS.LEGISLATION]) {
    test(`GET request to ${endpoint} should return HTML content`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${endpoint}`);
      
      // Status code assertion
      await test.expect(response.status()).toBe(200);
      
      // Check content type
      const headers = response.headers();
      test.expect(headers['content-type']).toContain(CONTENT_TYPES.HTML);
      
      // Verify URL pattern
      test.expect(URL_PATTERNS.HTML_PAGES.test(response.url())).toBeTruthy();
    });
  }

  // Test for API documentation
  test('GET request to API docs should return HTML content', async ({ request }) => {
    const response = await request.get(URLS.API_DOCS);
    
    // Status code assertion
    await test.expect(response.status()).toBe(200);
    
    // Check content type
    const headers = response.headers();
    test.expect(headers['content-type']).toContain(CONTENT_TYPES.HTML);
    
    // Verify URL pattern
    test.expect(URL_PATTERNS.HTML_DOCS.test(response.url())).toBeTruthy();
  });

  // Test for PDF files
  for (const [name, url] of Object.entries({
    'Agreement': URLS.AGREEMENT_PDF,
    'Policy': URLS.POLICY_PDF
  })) {
    test(`GET request to ${name} PDF should return PDF content`, async ({ request }) => {
      const response = await request.get(url);
      
      // Status code assertion
      await test.expect(response.status()).toBe(200);
      
      // Check content type
      const headers = response.headers();
      test.expect(headers['content-type']).toContain(CONTENT_TYPES.PDF);
      
      // Verify PDF URL pattern
      test.expect(URL_PATTERNS.PDF_FILES.test(response.url())).toBeTruthy();
    });
  }
});
