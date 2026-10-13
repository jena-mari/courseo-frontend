import { test, expect } from '@playwright/test';

const user = { id: 'router-test', email: 'router@example.test', display_name: 'Router Test', degree_code: '766', commencement_year: 2026, campus: 'Wollongong', major: null, elective_mode: 'degree', elective_interests: [] };
async function authenticate(page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({json:user});
    if (path.endsWith('/keys/providers')) return route.fulfill({json:{providers:[{provider:'google', label:'Gemini', console_url:'https://example.test', models:[{name:'gemini-test',label:'Test model',priced:false}],default_model:'gemini-test',key_count:1,has_usable_key:true}],default_model:'gemini-test'}});
    return route.fulfill({status:404,json:{detail:'Unexpected test API request'}});
  });
  await page.addInitScript(() => {
    const prefix = 'courseo:account:router-test:';
    localStorage.setItem(prefix + 'courseoLlmPrivacyAcknowledgedV1', 'router-test');
    if (!localStorage.getItem(prefix + 'courseoChats')) localStorage.setItem(prefix + 'courseoChats', JSON.stringify([{id:'saved-chat',backendSessionId:'saved-chat',title:'Reload test',studyPlanData:null,messages:[{id:'message-one',role:'assistant',content:'Your saved conversation survived reload.',timestamp:'2026-10-13T00:00:00Z'}]}]));
  });
}

test('authenticated chat survives a direct visit and two full reloads with saved conversation intact', async ({page}) => {
  await authenticate(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/chat');
  expect(response.status()).toBe(200);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(page.getByRole('region', {name:'Conversation',exact:true})).toContainText('Your saved conversation survived reload.');
    await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
    await expect(page).toHaveURL(/\/chat$/);
    if (attempt < 2) expect((await page.reload()).status()).toBe(200);
  }
  expect(errors).toEqual([]);
});

test('settings navigation, reload, browser back and forward preserve their routes', async ({page}) => {
  await authenticate(page);
  await page.goto('/chat');
  await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
  await page.getByRole('button', {name:'Settings',exact:true}).click();
  await expect(page.getByRole('heading', {name:'Settings',exact:true})).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole('heading', {name:'Settings',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
  await page.goForward();
  await expect(page.getByRole('heading', {name:'Settings',exact:true})).toBeVisible();
});

test('a signed-out direct chat visit and reload show the signed-out landing instead of a 404', async ({page}) => {
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({status:401,json:{detail:'Not authenticated'}}));
  expect((await page.goto('/chat')).status()).toBe(200);
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByRole('button', {name:'Log in',exact:true})).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole('button', {name:'Log in',exact:true})).toBeVisible();
});

test('deployed chat direct navigation and reload serve the app shell', async ({page}) => {
  test.skip(!process.env.COURSEO_E2E_SITE_URL, 'Set COURSEO_E2E_SITE_URL to test the live deployment.');
  const url = new URL('/chat', process.env.COURSEO_E2E_SITE_URL).href;
  const response = await page.goto(url);
  expect(response.status(), 'The deployed host must serve index.html for /chat').toBe(200);
  await expect(page.locator('#root')).toBeAttached();
  expect((await page.reload()).status()).toBe(200);
});
