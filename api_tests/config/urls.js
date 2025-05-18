/**
 * URL configuration for Kintsugi API tests
 */

// Base URL
export const BASE_URL = 'https://kintsugi.su';

// Endpoints
export const ENDPOINTS = {
  HOME: '/',
  APP: '/app',
  ABOUT: '/about',
  CONTACTS: '/contacts',
  LEGISLATION: '/legislation',
  API_DOCS: '/docs/api.html',
  AGREEMENT_PDF: '/files/agreement.pdf',
  POLICY_PDF: '/files/policy.pdf'
};

// Full URLs (for convenience)
export const URLS = {
  HOME: `${BASE_URL}${ENDPOINTS.HOME}`,
  APP: `${BASE_URL}${ENDPOINTS.APP}`,
  ABOUT: `${BASE_URL}${ENDPOINTS.ABOUT}`,
  CONTACTS: `${BASE_URL}${ENDPOINTS.CONTACTS}`,
  LEGISLATION: `${BASE_URL}${ENDPOINTS.LEGISLATION}`,
  API_DOCS: `${BASE_URL}${ENDPOINTS.API_DOCS}`,
  AGREEMENT_PDF: `${BASE_URL}${ENDPOINTS.AGREEMENT_PDF}`,
  POLICY_PDF: `${BASE_URL}${ENDPOINTS.POLICY_PDF}`
};

// URL patterns for testing with RegExp
export const URL_PATTERNS = {
  HTML_PAGES: new RegExp(`^${BASE_URL}/(|app|about|contacts|legislation)$`),
  HTML_DOCS: new RegExp(`^${BASE_URL}/docs/.*\\.html$`),
  PDF_FILES: new RegExp(`^${BASE_URL}/files/.*\\.pdf$`)
};

// Expected content types
export const CONTENT_TYPES = {
  HTML: 'text/html',
  PDF: 'application/pdf'
};