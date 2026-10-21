import { test, expect } from '@playwright/test';

const user = {
  id: 'saved-plans-user', email: 'plans@example.test', display_name: 'Plan Tester',
  degree_code: '766', commencement_year: 2026, campus: 'Wollongong', major: null,
  elective_mode: 'degree', elective_interests: [],
};
const initialPlan = { plan: [{ year: '2027', sessions: [{ session: 'Autumn', subjects: [{ code: 'CSIT111', name: 'Fundamentals of Programming', cp: 6 }] }] }] };

test('a generated plan can be saved, retrieved, edited, and reloaded from the profile', async ({ page }) => {
  const saved = [];
  await page.addInitScript(({ userId, plan }) => {
    const prefix = `courseo:account:${encodeURIComponent(userId)}:`;
    localStorage.setItem(prefix + 'courseoLlmPrivacyAcknowledgedV1', userId);
    localStorage.setItem(prefix + 'courseoChats', JSON.stringify([{
      id: 'plan-chat', backendSessionId: 'plan-chat', title: 'Create my study plan',
      messages: [
        { id: 'user-message', role: 'user', content: 'Create my study plan', timestamp: '2026-10-20T00:00:00.000Z' },
        { id: 'assistant-message', role: 'assistant', content: 'Here is your plan.', timestamp: '2026-10-20T00:00:01.000Z' },
      ], studyPlanData: plan,
    }]));
  }, { userId: user.id, plan: initialPlan });

  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: user }));
  await page.route('**/api/v1/keys/providers', (route) => route.fulfill({ json: {
    providers: [{ provider: 'google', label: 'Gemini', console_url: 'https://example.test',
      models: [{ name: 'gemini-test', label: 'Test model', priced: false }],
      default_model: 'gemini-test', key_count: 1, has_usable_key: true }], default_model: 'gemini-test',
  } }));
  await page.route('**/api/v1/plans**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'POST' && url.pathname === '/api/v1/plans') {
      const body = request.postDataJSON();
      const item = { id: 'saved-plan-1', ...body, created_at: '2026-10-20T00:00:00.000Z', updated_at: '2026-10-20T00:00:00.000Z' };
      saved.push(item);
      return route.fulfill({ status: 201, json: item });
    }
    if (request.method() === 'GET' && url.pathname === '/api/v1/plans') return route.fulfill({ json: saved });
    if (request.method() === 'PUT') {
      const body = request.postDataJSON();
      const index = saved.findIndex((item) => item.id === 'saved-plan-1');
      saved[index] = { ...saved[index], ...body, updated_at: '2026-10-20T00:01:00.000Z' };
      return route.fulfill({ json: saved[index] });
    }
    if (request.method() === 'DELETE') {
      const index = saved.findIndex((item) => item.id === 'saved-plan-1');
      if (index >= 0) saved.splice(index, 1);
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/chat');
  await page.getByRole('button', { name: 'Save to profile' }).click();
  await expect(page.getByRole('button', { name: 'Saved to profile' })).toBeVisible();

  await page.getByRole('button', { name: 'Chat actions' }).click();
  await page.getByRole('button', { name: 'Saved plans', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Saved study plans' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Create my study plan/ })).toBeVisible();
  await expect(page.getByText('CSIT111 — Fundamentals of Programming')).toBeVisible();

  await page.getByRole('button', { name: 'Edit plan' }).click();
  await page.getByRole('textbox', { name: 'Study plan data' }).fill(JSON.stringify({
    plan: [{ year: '2027', sessions: [{ session: 'Spring', subjects: [{ code: 'CSIT111', name: 'Updated Fundamentals', cp: 6 }] }] }],
  }, null, 2));
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved plan updated to your profile.');
  await expect(page.getByText('CSIT111 — Updated Fundamentals')).toBeVisible();
  await page.reload();
  await expect(page.getByText('CSIT111 — Updated Fundamentals')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete plan' }).click();
  await expect(page.getByRole('heading', { name: 'No saved plans yet' })).toBeVisible();
});
