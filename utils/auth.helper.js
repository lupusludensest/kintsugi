import dotenv from 'dotenv';

dotenv.config();

export async function loginUser(page) {
    await page.goto(`${process.env.KINTSUGI_BASE_URL}/login`);
    await page.fill('input[type="email"]', process.env.KINTSUGI_LOGIN);
    await page.fill('input[type="password"]', process.env.KINTSUGI_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    return page;
}

export async function getAuthToken(request) {
    const response = await request.post(`${process.env.KINTSUGI_BASE_URL}/api/auth/login`, {
        data: {
            email: process.env.KINTSUGI_LOGIN,
            password: process.env.KINTSUGI_PASSWORD
        }
    });
    const data = await response.json();
    return data.token; // Adjust according to actual API response
}
