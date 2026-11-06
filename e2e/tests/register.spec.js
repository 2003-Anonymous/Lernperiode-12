const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

test('Registrieren, abmelden und mit neuem Konto anmelden', async ({ page }) => {
  const username = `test_${randomUUID().replaceAll('-', '').slice(0, 20)}`;
  const password = 'Registrierung123!';
  await page.goto('/register.html');
  await page.getByLabel('Benutzername', { exact: true }).fill(username);
  await page.getByLabel('Passwort', { exact: true }).fill(password);
  await page.getByLabel('Passwort bestätigen', { exact: true }).fill(password);
  const registered = page.waitForResponse(r => r.url().endsWith('/Account/register') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Konto erstellen' }).click();
  const response = await registered;
  expect(response.status()).toBe(201);
  await expect(page.getByRole('heading', { name: 'Dein Konto ist bereit.' })).toBeVisible();
  const me = await page.request.get('/Account/me');
  expect(me.status()).toBe(200);
  const account = await me.json();
  expect(account.username).toBe(username);
  expect(account.role).toBe('User');
  expect(account).not.toHaveProperty('password');
  expect((await page.request.post('/Account/logout')).status()).toBe(204);
  await page.goto('/index.html');
  await page.getByLabel('Benutzername', { exact: true }).fill(username);
  await page.getByLabel('Passwort', { exact: true }).fill(password);
  const loggedIn = page.waitForResponse(r => r.url().endsWith('/Account/login') && r.request().method() === 'POST');
  await page.getByRole('button', { name: /Einloggen/ }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(/home\.html/);
});

test('Vergebener Benutzername zeigt einen Fehler', async ({ page }) => {
  await page.goto('/register.html');
  await page.getByLabel('Benutzername', { exact: true }).fill('user');
  await page.getByLabel('Passwort', { exact: true }).fill('geheim123');
  await page.getByLabel('Passwort bestätigen', { exact: true }).fill('geheim123');
  await page.getByRole('button', { name: 'Konto erstellen' }).click();
  await expect(page.getByRole('alert')).toContainText('bereits vergeben');
  await expect(page.getByRole('button', { name: 'Konto erstellen' })).toBeEnabled();
});

test('Unterschiedliche Passwörter werden vor dem Senden abgefangen', async ({ page }) => {
  let posts = 0;
  page.on('request', r => { if (r.url().endsWith('/Account/register')) posts++; });
  await page.goto('/register.html');
  await page.getByLabel('Benutzername', { exact: true }).fill('navid_test');
  await page.getByLabel('Passwort', { exact: true }).fill('geheim123');
  await page.getByLabel('Passwort bestätigen', { exact: true }).fill('anders123');
  await page.getByRole('button', { name: 'Konto erstellen' }).click();
  await expect(page.locator('#confirm-password-error')).toBeVisible();
  expect(posts).toBe(0);
});
