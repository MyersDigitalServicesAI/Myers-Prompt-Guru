import { test, expect } from '@playwright/test';

test('debug page content', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for React to mount
    await page.waitForTimeout(5000);

    const bodyText = await page.innerText('body');
    console.log('--- BODY TEXT START ---');
    console.log(bodyText);
    console.log('--- BODY TEXT END ---');

    console.log('--- CONSOLE ERRORS START ---');
    console.log(errors.join('\n'));
    console.log('--- CONSOLE ERRORS END ---');

    const rootHtml = await page.locator('#root').innerHTML();
    console.log('--- ROOT HTML ---');
    console.log(rootHtml);
});
