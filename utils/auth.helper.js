import dotenv from "dotenv";

dotenv.config();

function validateEnvVars() {
  const required = [
    "KINTSUGI_LOGIN_URL",
    "KINTSUGI_LOGIN",
    "KINTSUGI_PASSWORD",
    "TIMEOUT"
  ];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export async function loginUser(page) {
  validateEnvVars();
  await page.setViewportSize({ width: 1920, height: 1080 });
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto(process.env.KINTSUGI_LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 20000 });
      await page.fill('input[name="email"]', process.env.KINTSUGI_LOGIN);
      await page.fill('input[name="password"]', process.env.KINTSUGI_PASSWORD);
      const submitButton = page.locator('button:has-text("Войти")');
      await Promise.all([
        page.waitForURL("**/dashboard", { timeout: parseInt(process.env.TIMEOUT) }),
        submitButton.click(),
      ]);
      await page.waitForLoadState("networkidle", { timeout: 20000 });
      // Confirm login success
      if ((await page.url()).includes("dashboard")) {
        return true;
      }
      throw new Error("Login did not redirect to dashboard");
    } catch (err) {
      lastError = err;
      console.error(`[loginUser] Attempt ${attempt} failed:`, err.message);
      await page.screenshot({ path: `ui_tests/pic_generated_in_tests/login-failed-attempt-${attempt}.png`, fullPage: true });
      if (attempt === 2) {
        throw new Error(`Login failed after 2 attempts: ${err.message}`);
      }
      // Optionally reload page before retry
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  }
  return false;
}

export async function getAuthToken(request) {
  validateEnvVars();
  const response = await request.post(
    `${process.env.KINTSUGI_BASE_URL}/api/auth/login`,
    {
      data: {
        email: process.env.KINTSUGI_LOGIN,
        password: process.env.KINTSUGI_PASSWORD,
      },
    }
  );
  const data = await response.json();
  return data.token;
}
