const { test, expect } = require('@playwright/test');

test('Login mit richtigen Daten öffnet die Homepage', async ({ page }) => {
  await page.goto('/');

  await page.locator('#username').fill('user');
  await page.locator('#password').fill('user123');

  const loginResponsePromise = page.waitForResponse(
    response =>
      response.url().endsWith('/Account/login') &&
      response.request().method() === 'POST'
  );

  await page.locator('button[type="submit"]').click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);

  await expect(page).toHaveURL(/home\.html/, { timeout: 15000 });
  await expect(page.locator('#balance')).toHaveText('500');
});

test('Falsches Passwort zeigt eine Fehlermeldung', async ({ page }) => {
  await page.goto('/');

  await page.locator('#username').fill('user');
  await page.locator('#password').fill('falsch');
  await page.locator('button[type="submit"]').click();

  await expect(page).not.toHaveURL(/home\.html/);
  await expect(
    page.getByText('Benutzername oder Passwort falsch.')
  ).toBeVisible();
});