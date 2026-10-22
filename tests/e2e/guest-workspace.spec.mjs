import { test, expect } from '@playwright/test';

test('guest workspace creation is not offered on the account entry screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Proceed to Courseo' }).click();
  await expect(page.getByRole('button', { name: 'Continue as guest' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});
