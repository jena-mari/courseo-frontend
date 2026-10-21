import { test, expect } from '@playwright/test';

const originalUser = {
  id: 'account-ui-user', email: 'account@example.test', display_name: 'Original Name',
  degree_code: '766', commencement_year: 2026, campus: 'Wollongong', major: null,
  elective_mode: 'degree', elective_interests: [], created_at: '2026-10-20T00:00:00.000Z',
};

async function openSignedInChat(page, handleAuth) {
  await page.addInitScript((userId) => localStorage.setItem(
    `courseo:account:${encodeURIComponent(userId)}:courseoLlmPrivacyAcknowledgedV1`, userId,
  ), originalUser.id);
  await page.route('**/api/v1/auth/me', handleAuth);
  await page.route('**/api/v1/keys/providers', (route) => route.fulfill({ json: {
    providers: [{ provider: 'google', label: 'Gemini', console_url: 'https://example.test',
      models: [{ name: 'gemini-test', label: 'Test model', priced: false }],
      default_model: 'gemini-test', key_count: 1, has_usable_key: true }], default_model: 'gemini-test',
  } }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/chat');
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Account settings' })).toBeVisible();
}

test('profile changes save through the account settings UI', async ({ page }) => {
  let currentUser = { ...originalUser };
  let updatePayload;
  await openSignedInChat(page, async (route) => {
    if (route.request().method() === 'PATCH') {
      updatePayload = route.request().postDataJSON();
      currentUser = { ...currentUser, ...updatePayload };
    }
    return route.fulfill({ json: currentUser });
  });
  await page.getByLabel('Preferred name').fill('Updated Student');
  await page.getByRole('button', { name: 'Save account details' }).click();
  await expect(page.getByRole('status')).toContainText('Account details updated.');
  expect(updatePayload.display_name).toBe('Updated Student');
});

test('account deletion confirms through React, submits the password, and signs out', async ({ page }) => {
  let deletePayload;
  await openSignedInChat(page, async (route) => {
    if (route.request().method() === 'DELETE') {
      deletePayload = route.request().postDataJSON();
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: originalUser });
  });
  await page.getByRole('button', { name: 'Delete account', exact: true }).click();
  await page.getByRole('alertdialog').getByLabel('Current password').fill('test-only-password');
  await page.getByRole('button', { name: 'Permanently delete account' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/#/');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
  expect(deletePayload).toEqual({ password: 'test-only-password' });
});
