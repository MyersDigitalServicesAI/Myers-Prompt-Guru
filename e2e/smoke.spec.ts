import { test, expect } from '@playwright/test';

test('has title and redirects to login', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PromptMaster/);

  // Expect the page to be redirected to /login for unauthenticated users
  await expect(page).toHaveURL('/login');
  
  // Expect the login card to be visible with the correct title
  await expect(page.getByText('Welcome Back')).toBeVisible();
  await expect(page.getByText('Enter your credentials to access your prompt library.')).toBeVisible();
});
