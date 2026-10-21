import { test, expect } from '@playwright/test';

test('guest can start an isolated workspace and delete it from account settings', async ({ page }) => {
  const guest = {
    id: 'guest-e2e', email: 'guest-e2e@guest.courseo.invalid', display_name: 'Guest',
    degree_code: '766', commencement_year: null, campus: null, major: null,
    elective_interests: [], is_guest: true,
  };
  let guestCreated = false;
  let guestDeleted = false;
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: guestCreated && !guestDeleted ? 200 : 401,
    json: guestCreated && !guestDeleted ? guest : { detail: 'Not authenticated' },
  }));
  await page.route('**/api/v1/auth/guest', async (route) => {
    if (route.request().method() === 'POST') {
      guestCreated = true;
      return route.fulfill({ status: 201, json: guest });
    }
    if (route.request().method() === 'DELETE') {
      guestDeleted = true;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 405 });
  });
  await page.route('**/api/v1/keys/providers', (route) => route.fulfill({ json: {
    providers: [{ provider: 'google', label: 'Gemini', console_url: 'https://example.test',
      models: [{ name: 'gemini-test', label: 'Test model', priced: false }],
      default_model: 'gemini-test', key_count: 1, has_usable_key: true }], default_model: 'gemini-test',
  } }));
  await page.route('**/api/v1/plans**', (route) => route.fulfill({ json: [] }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Proceed to Courseo' }).click();
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await expect(page.getByRole('heading', { name: 'What Courseo sends to the AI provider' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'I understand — continue to chat' }).click();
  await expect(page.getByRole('textbox', { name: 'Message Courseo' })).toBeEnabled();

  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByRole('heading', { name: 'Delete guest workspace?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete guest workspace' }).click();
  await expect(page).toHaveURL(/#\/$/);
  expect(guestDeleted).toBe(true);
});
