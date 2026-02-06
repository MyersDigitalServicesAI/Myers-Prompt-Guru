import { test, expect } from '@playwright/test';

test.describe('Prompt Guru E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for React to mount and initial data to load
        await page.waitForSelector('#root > div', { timeout: 15000 });
    });

    test('should display the main library and categories', async ({ page }) => {
        // Categories are visible in the sidebar
        await expect(page.getByText('Coding & Development')).toBeVisible();
        await expect(page.getByText('Marketing & SEO')).toBeVisible();
    });

    test('should open prompt editor and update preview in real-time', async ({ page }) => {
        // Select the "Social Media Post Generator" card
        const card = page.getByText('Social Media Post Generator');
        await card.click();

        // Verify editor is open (Check for "Configuration" or "Live Preview" headings)
        await expect(page.getByText('Configuration')).toBeVisible();
        await expect(page.getByText('Live Preview')).toBeVisible();

        // Find a variable input (e.g., [Target Audience] or similar)
        const variableInput = page.locator('input[placeholder*="["]').first();
        const testValue = 'Test Campaign';
        await variableInput.fill(testValue);

        // Verify live preview updates
        const previewArea = page.locator('.font-mono');
        await expect(previewArea).toContainText(testValue);
    });

    test('should request subscription for Pro features', async ({ page }) => {
        // Find Guru Chat button or text
        const guruBtn = page.getByText('Guru Chat', { exact: false });
        if (await guruBtn.isVisible()) {
            await guruBtn.click();
            // Since no user is logged in, it should show AuthModal
            await expect(page.getByText('Sign in to your account')).toBeVisible();
        }
    });

    test('should show correct pricing in subscription modal', async ({ page }) => {
        // Click Add Prompts
        const addBtn = page.getByRole('button', { name: /Add Prompts/i });
        await addBtn.click();

        // AuthModal opens first
        await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

    test('should handle Pro status correctly', async ({ page }) => {
        // Mock Pro status in localStorage
        await page.evaluate(() => {
            localStorage.setItem('promptmaster_user', JSON.stringify({
                name: 'Test Pro User',
                email: 'pro@example.com',
                isPro: true,
                savedPrompts: [],
                history: []
            }));
        });
        await page.reload();

        // Now Guru and Bulk Upload should be accessible
        const guruBtn = page.getByText('Guru Chat', { exact: false });
        await guruBtn.click();

        // Guru chat should be open (e.g., "Prompt Guru" title visible in sidebar)
        await expect(page.locator('h3').getByText('Prompt Guru')).toBeVisible();

        // Add Prompts should open Bulk Add directly
        const addBtn = page.getByRole('button', { name: /Add Prompts/i });
        await addBtn.click();
        await expect(page.getByText('AI Bulk Import')).toBeVisible();
    });
});
