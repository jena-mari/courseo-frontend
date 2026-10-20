import { test, expect } from '@playwright/test';

const user = {
  id: 'policy-student', email: 'student@example.test', display_name: 'Test Student',
  degree_code: '766', commencement_year: null, campus: null, major: null,
  elective_interests: [], created_at: '2026-10-20T00:00:00Z',
};
const acknowledgement = `courseo:account:${user.id}:courseoLlmPrivacyAcknowledgedV1`;

async function mockAccount(page, { rejectFirst = false, signedInInitially = false } = {}) {
  let signedIn = signedInInitially;
  const registrations = [];
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/register')) {
      registrations.push(route.request().postDataJSON());
      if (rejectFirst && registrations.length === 1) {
        return route.fulfill({ status: 503, json: { detail: 'Temporarily unavailable' } });
      }
      signedIn = true;
      return route.fulfill({ status: 201, json: user });
    }
    if (path.endsWith('/auth/me')) {
      return signedIn ? route.fulfill({ json: user })
        : route.fulfill({ status: 401, json: { detail: 'Not authenticated' } });
    }
    if (path.endsWith('/keys/providers')) {
      return route.fulfill({ json: { providers: [{
        provider: 'google', label: 'Gemini', console_url: 'https://example.test',
        models: [{ name: 'test-model', label: 'Test model', priced: false }],
        default_model: 'test-model', key_count: 1, has_usable_key: true,
      }], default_model: 'test-model' } });
    }
    if (path.endsWith('/keys')) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { detail: 'Unexpected request' } });
  });
  return registrations;
}

async function fillRegistration(page) {
  await page.getByRole('textbox', { name: 'Preferred name', exact: true }).fill('Test Student');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-only-password');
  await page.getByLabel('Confirm Password', { exact: true }).fill('test-only-password');
}

async function agreeToPolicy(page) {
  const dialog = page.getByRole('alertdialog', { name: 'Courseo’s AI Policy', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Your submitted content is sent', { exact: true })).toBeVisible();
  const agree = dialog.getByRole('button', { name: 'Agree and continue', exact: true });
  await expect(agree).toBeDisabled();
  await dialog.getByRole('checkbox').check();
  await agree.click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'I agree to Courseo’s AI Policy', exact: true })).toBeChecked();
}

test('registration requires AI disclosure agreement and saves it only for the successfully created account', async ({ page }) => {
  const registrations = await mockAccount(page, { rejectFirst: true });
  await page.addInitScript(() => {
    localStorage.setItem('courseo:account:other-student:courseoLlmPrivacyAcknowledgedV1', 'other-student');
  });
  await page.goto('/#/register');
  await expect(page.getByText(/Privacy policy/i)).toHaveCount(0);
  await fillRegistration(page);

  await page.getByRole('button', { name: 'Register now', exact: true }).click();
  await agreeToPolicy(page);
  expect(registrations).toHaveLength(0);
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBeNull();

  await page.getByRole('button', { name: 'Register now', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBeNull();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(user.email);

  await page.getByRole('button', { name: 'Register now', exact: true }).click();
  // The existing guest-route guard sends users with a display name to chat.
  await expect(page).toHaveURL(/#\/chat$/);
  expect(registrations).toHaveLength(2);
  expect(registrations[1]).toEqual({ email: user.email, password: 'test-only-password', display_name: 'Test Student' });
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBe(user.id);
  expect(await page.evaluate(() => localStorage.getItem('courseo:account:other-student:courseoLlmPrivacyAcknowledgedV1'))).toBe('other-student');

  await expect(page.getByRole('textbox', { name: 'Message Courseo' })).toBeEnabled();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Message Courseo' })).toBeEnabled();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  await page.goto('/#/settings?tab=system');
  await page.getByRole('button', { name: 'View warning', exact: true }).click();
  const warning = page.getByRole('alertdialog', { name: 'What Courseo sends to the AI provider', exact: true });
  await expect(warning).toBeVisible();
  await expect(warning.getByRole('checkbox')).toHaveCount(0);
  await warning.getByRole('button', { name: 'Close warning', exact: true }).click();
  await expect(warning).not.toBeVisible();
});

test('an existing account without an acknowledgement still reviews the original chat warning', async ({ page }) => {
  await mockAccount(page, { signedInInitially: true });
  await page.goto('/#/chat');
  const warning = page.getByRole('alertdialog', { name: 'What Courseo sends to the AI provider', exact: true });
  await expect(warning).toBeVisible();
  const continueButton = warning.getByRole('button', { name: 'I understand — continue to chat', exact: true });
  await expect(continueButton).toBeDisabled();
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBeNull();
  await warning.getByRole('checkbox').check();
  await continueButton.click();
  await expect(warning).not.toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBe(user.id);
});

test('mobile landing registration opens the warning as a viewport dialog and cancellation preserves the form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const registrations = await mockAccount(page);
  await page.goto('/#/');
  await page.getByRole('button', { name: /Proceed to Courseo/ }).click();
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await fillRegistration(page);

  const policyLink = page.getByRole('button', { name: 'Courseo’s AI Policy', exact: true });
  await policyLink.click();
  const dialog = page.getByRole('alertdialog', { name: 'Courseo’s AI Policy', exact: true });
  await expect(dialog).toBeVisible();
  const consent = dialog.getByRole('checkbox');
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(consent).toBeFocused();
  const viewportOverlay = await dialog.evaluate(el => el.parentElement.parentElement === document.body);
  expect(viewportOverlay).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(policyLink).toBeFocused();
  await expect(page.getByRole('checkbox', { name: 'I agree to Courseo’s AI Policy', exact: true })).not.toBeChecked();
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('test-only-password');
  expect(registrations).toHaveLength(0);

  await page.getByRole('checkbox', { name: 'I agree to Courseo’s AI Policy', exact: true }).click();
  await agreeToPolicy(page);
  await page.getByRole('checkbox', { name: 'I agree to Courseo’s AI Policy', exact: true }).uncheck();
  await expect(page.getByRole('checkbox', { name: 'I agree to Courseo’s AI Policy', exact: true })).not.toBeChecked();
  expect(registrations).toHaveLength(0);
  expect(await page.evaluate(key => localStorage.getItem(key), acknowledgement)).toBeNull();
});
