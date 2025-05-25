import dotenv from "dotenv";

dotenv.config();

export async function loginUser(page) {
  // Set viewport wider than 1440px requirement
  await page.setViewportSize({ width: 1920, height: 1080 });
  // Login using correct Kintsugi selectors
  await page.goto(process.env.KINTSUGI_LOGIN_URL);
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', process.env.KINTSUGI_LOGIN);
  await page.fill('input[name="password"]', process.env.KINTSUGI_PASSWORD);
  const submitButton = page.locator('button:has-text("Войти")');
  await Promise.all([
    page.waitForURL("**/dashboard", { timeout: parseInt(process.env.TIMEOUT) }),
    submitButton.click(),
  ]);
  await page.waitForLoadState("networkidle");
}

export async function getAuthToken(request) {
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
