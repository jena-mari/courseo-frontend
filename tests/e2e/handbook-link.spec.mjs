import { test, expect } from '@playwright/test';

test('handbook links follow the active chat course code', async ({ page }) => {
  await page.addInitScript(() => {
    window.__openedUrls = [];
    window.open = (url) => {
      window.__openedUrls.push(String(url));
      return null;
    };
  });
  const user = {
    id: 'handbook-link-user', email: 'student@example.test', display_name: 'Student',
    degree_code: '766', commencement_year: 2024, campus: 'Wollongong', major: null,
    elective_interests: [], is_guest: false,
  };
  await page.addInitScript((userId) => {
    localStorage.setItem(`courseo:account:${encodeURIComponent(userId)}:courseoChats`, JSON.stringify([{
      id: 'course-session', backendSessionId: 'course-session', title: 'My course plan',
      messages: [
        { id: 'prompt', role: 'assistant', content: 'What is your UOW course code?', timestamp: new Date().toISOString() },
        { id: 'answer', role: 'user', content: '1807', timestamp: new Date().toISOString() },
      ], studyPlanData: null, model: 'test-model',
    }]));
  }, user.id);
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ json: user });
    if (path.endsWith('/chat/course-session')) return route.fulfill({ json: { session_id: 'course-session', degree_code: 'UNKNOWN', messages: [] } });
    if (path.endsWith('/keys/providers')) return route.fulfill({ json: { providers: [], default_model: null } });
    return route.fulfill({ json: [] });
  });

  const expected = 'https://courses.uow.edu.au/courses/2024/1807';
  await page.goto('/#/chat');
  await expect(page.getByRole('link', { name: 'Open your handbook' })).toHaveAttribute('href', expected);

  await page.getByRole('button', { name: 'Chat actions' }).click();
  await page.getByRole('button', { name: 'Your Handbook →' }).click({ force: true });
  await expect.poll(() => page.evaluate(() => window.__openedUrls)).toEqual([expected]);

  await expect.poll(() => page.evaluate((userId) => {
    const raw = localStorage.getItem(`courseo:account:${encodeURIComponent(userId)}:courseoChats`);
    return raw ? JSON.parse(raw)[0]?.degreeCode : null;
  }, user.id)).toBe('1807');
  await page.goto('/#/settings?tab=profile');
  await expect(page.getByRole('link', { name: 'Open your handbook' })).toHaveAttribute('href', expected);

});
