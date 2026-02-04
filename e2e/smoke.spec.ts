import { test, expect } from '@playwright/test';

test('has title and redirects to login', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Myers Prompt Guru/);

  // Expect the page to be redirected to /login for unauthenticated users
  await expect(page).toHaveURL('/login');
  
  // Expect the login card to be visible with the correct title
  await expect(page.getByText('Welcome Back')).toBeVisible();
  await expect(page.getByText('Enter your credentials to access your prompt library.')).toBeVisible();
});

test('allows a new user to sign up and redirects to the dashboard', async ({ page }) => {
  await page.goto('/login');

  // Click the link to switch to the sign-up form
  // Using getByRole for better accessibility and resilience
  await page.getByRole('button', { name: 'Sign up' }).click();

  // Verify we are on the sign-up form
  await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
  
  // Use a unique email for each test run to avoid conflicts
  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const password = 'password123';

  // Fill in the sign-up form
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill(password);

  // Submit the form by clicking the main "Sign Up" button
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

  // After sign-up, the user should be redirected to the dashboard
  // We'll give it a bit more time to handle the backend user creation and redirection
  await expect(page).toHaveURL('/', { timeout: 10000 });

  // Verify that the dashboard is loaded by checking for a key element
  await expect(page.getByRole('heading', { name: 'Prompt Library' })).toBeVisible();
});
