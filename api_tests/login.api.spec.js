import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

// Test to find the correct login endpoint
test("find correct login API endpoint", async ({ request }) => {
  const commonLoginPaths = [
    "/api/login",
    "/api/v1/login",
    "/api/v1/auth/login",
    "/api/auth/signin",
    "/api/user/login",
    "/login/api",
    "/auth/api/login",
    "/api/session",
    "/api/authenticate",
  ];

  console.log("Testing common login endpoints...");

  for (const path of commonLoginPaths) {
    try {
      const url = `${process.env.KINTSUGI_BASE_URL}${path}`;
      console.log(`Testing: ${url}`);

      const response = await request.post(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          email: process.env.KINTSUGI_LOGIN,
          password: process.env.KINTSUGI_PASSWORD,
        },
      });

      console.log(`${path} - Status: ${response.status()}`);

      if (response.status() === 200) {
        console.log(`✅ Found working endpoint: ${path}`);
        const body = await response.text();
        console.log("Response:", body);

        try {
          const jsonBody = JSON.parse(body);
          if (jsonBody.token) {
            console.log(`🎉 Token found at ${path}!`);
            expect(jsonBody).toHaveProperty("token");
            expect(typeof jsonBody.token).toBe("string");
            return;
          }
        } catch (e) {
          console.log("Response is not JSON");
        }
      } else if (response.status() !== 404 && response.status() !== 405) {
        console.log(`${path} - Unexpected status: ${response.status()}`);
        const responseText = await response.text();
        console.log(`Response: ${responseText}`);
      }
    } catch (error) {
      console.log(`${path} - Error: ${error.message}`);
    }
  }
});

// Test using browser automation to intercept actual API calls
test("intercept login API calls via browser", async ({ page, context }) => {
  const apiCalls = [];

  // Intercept all network requests
  page.on("request", (request) => {
    if (request.url().includes("login") || request.url().includes("auth")) {
      console.log(`🔍 API Call: ${request.method()} ${request.url()}`);
      apiCalls.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
      });
    }
  });

  page.on("response", (response) => {
    if (response.url().includes("login") || response.url().includes("auth")) {
      console.log(`📡 API Response: ${response.status()} ${response.url()}`);
    }
  });

  // Perform the login via browser
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(process.env.KINTSUGI_LOGIN_URL);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', process.env.KINTSUGI_LOGIN);
  await page.fill('input[name="password"]', process.env.KINTSUGI_PASSWORD);

  const submitButton = page.locator('button:has-text("Войти")');
  await submitButton.click();

  // Wait a bit to capture all network calls
  await page.waitForTimeout(3000);

  console.log("\n📋 Captured API calls:");
  apiCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.method} ${call.url}`);
    if (call.postData) {
      console.log(`   Data: ${call.postData}`);
    }
  });

  // If we captured login calls, extract the correct endpoint
  const loginCall = apiCalls.find(
    (call) =>
      call.method === "POST" &&
      (call.url.includes("login") || call.url.includes("auth"))
  );

  if (loginCall) {
    console.log(`\n✅ Found actual login endpoint: ${loginCall.url}`);
    console.log(`Method: ${loginCall.method}`);
    console.log(`Data: ${loginCall.postData}`);
  }
});

// Test with session-based approach (cookies)
test("test session-based login", async ({ request }) => {
  console.log("Trying session-based login approach...");

  // First get the login page to establish session
  const loginPageResponse = await request.get(process.env.KINTSUGI_LOGIN_URL);
  console.log(`Login page status: ${loginPageResponse.status()}`);

  // Try common session login endpoints
  const sessionPaths = ["/login", "/api/session", "/authenticate"];

  for (const path of sessionPaths) {
    try {
      const url = `${process.env.KINTSUGI_BASE_URL}${path}`;
      const response = await request.post(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        form: {
          email: process.env.KINTSUGI_LOGIN,
          password: process.env.KINTSUGI_PASSWORD,
        },
      });

      console.log(`${path} - Status: ${response.status()}`);

      if (response.status() === 200 || response.status() === 302) {
        const body = await response.text();
        console.log(`✅ Potential success at ${path}`);
        console.log("Response:", body);
      }
    } catch (error) {
      console.log(`${path} - Error: ${error.message}`);
    }
  }
});

// Fallback test - if API login doesn't work, test that browser login works
test("verify browser login still works", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(process.env.KINTSUGI_LOGIN_URL);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', process.env.KINTSUGI_LOGIN);
  await page.fill('input[name="password"]', process.env.KINTSUGI_PASSWORD);

  const submitButton = page.locator('button:has-text("Войти")');
  await Promise.all([
    page.waitForURL("**/dashboard", { timeout: parseInt(process.env.TIMEOUT) }),
    submitButton.click(),
  ]);

  console.log("✅ Browser login successful");
  expect(page.url()).toContain("dashboard");
});
