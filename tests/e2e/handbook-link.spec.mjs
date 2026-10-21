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
        { id: 'answer', role: 'user', content: 'Course code: 9999', timestamp: new Date().toISOString() },
      ], studyPlanData: null, model: 'test-model',
    }]));
  }, user.id);
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ json: user });
    if (path.endsWith('/chat/course-session')) return route.fulfill({ json: { session_id: 'course-session', degree_code: '1807', messages: [] } });
    if (path.endsWith('/keys/providers')) return route.fulfill({ json: { providers: [], default_model: null } });
    return route.fulfill({ json: [] });
  });

  const expected = 'https://courses.uow.edu.au/courses/2024/1807';
  await page.goto('/#/chat');
  await expect(page.getByRole('button', { name: 'Open your handbook' })).toBeEnabled();

  await page.getByRole('button', { name: 'Chat actions' }).click();
  await page.getByRole('button', { name: 'Your Handbook →' }).click({ force: true });
  await expect.poll(() => page.evaluate(() => window.__openedUrls)).toEqual([expected]);

  await expect.poll(() => page.evaluate((userId) => {
    const raw = localStorage.getItem(`courseo:account:${encodeURIComponent(userId)}:courseoChats`);
    return raw ? JSON.parse(raw)[0]?.degreeCode : null;
  }, user.id)).toBe('1807');
  await page.goto('/#/settings?tab=system');
  await expect(page.getByRole('button', { name: 'Open your handbook' })).toBeEnabled();
  await page.getByRole('button', { name: 'View handbook' }).click();
  await expect(page.getByRole('link', { name: 'Open your course handbook' })).toHaveAttribute('href', expected);

});

test('handbook link stays disabled until chat history confirms a course code', async ({ page }) => {
  const user = {
    id: 'unknown-handbook-user', email: 'unknown@example.test', display_name: 'Student',
    degree_code: '766', commencement_year: 2024, campus: 'Wollongong', major: null,
    elective_interests: [], is_guest: false,
  };
  await page.addInitScript((userId) => {
    localStorage.setItem(`courseo:account:${encodeURIComponent(userId)}:courseoChats`, JSON.stringify([{
      id: 'unknown-course-session', backendSessionId: 'unknown-course-session', title: 'My course plan',
      messages: [{ id: 'message', role: 'user', content: 'My course is Computer Science, student number 1807.' }],
      studyPlanData: null, model: 'test-model', degreeCode: '766',
    }]));
  }, user.id);
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ json: user });
    if (path.endsWith('/chat/unknown-course-session')) return route.fulfill({ json: { session_id: 'unknown-course-session', degree_code: 'UNKNOWN', messages: [] } });
    if (path.endsWith('/keys/providers')) return route.fulfill({ json: { providers: [], default_model: null } });
    return route.fulfill({ json: [] });
  });

  await page.goto('/#/chat');
  const handbookButton = page.getByRole('button', { name: 'Course not confirmed yet' });
  await expect(handbookButton).toBeDisabled();
  await page.getByRole('button', { name: 'Chat actions' }).click();
  await expect(page.getByRole('button', { name: 'Course not confirmed yet' }).last()).toBeDisabled();
  await page.goto('/#/settings?tab=system');
  await page.getByRole('button', { name: 'View handbook' }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Course not confirmed yet' })).toBeDisabled();
});
