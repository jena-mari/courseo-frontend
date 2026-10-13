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
  const response = await page.goto('/#/chat');
  expect(response.status()).toBe(200);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(page.getByRole('region', {name:'Conversation',exact:true})).toContainText('Your saved conversation survived reload.');
    await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
    await expect(page).toHaveURL(/#\/chat$/);
    if (attempt < 2) expect((await page.reload()).status()).toBe(200);
  }
  expect(errors).toEqual([]);
});

test('settings navigation, reload, browser back and forward preserve their routes', async ({page}) => {
  await authenticate(page);
  await page.goto('/#/chat');
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
  expect((await page.goto('/#/chat')).status()).toBe(200);
  await expect(page).toHaveURL('http://127.0.0.1:4173/#/');
  await expect(page.getByRole('button', {name:'Log in',exact:true})).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole('button', {name:'Log in',exact:true})).toBeVisible();
});

test('deployed chat direct navigation and reload serve the app shell', async ({page}) => {
  test.skip(!process.env.COURSEO_E2E_SITE_URL, 'Set COURSEO_E2E_SITE_URL to test the live deployment.');
  const url = new URL('/#/chat', process.env.COURSEO_E2E_SITE_URL).href;
  const response = await page.goto(url);
  expect(response.status(), 'The deployed host must serve index.html for /#/chat').toBe(200);
  await expect(page.locator('#root')).toBeAttached();
  expect((await page.reload()).status()).toBe(200);
});

test('hash routes work on a static host that returns 404 for clean paths', async ({page, request}) => {
  expect((await request.get('/chat')).status()).toBe(404);
  await authenticate(page);
  expect((await page.goto('/#/chat')).status()).toBe(200);
  await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole('textbox', {name:'Message Courseo'})).toBeEnabled();
});

test('Settings query parameters and API key anchor survive hash-route reloads', async ({page}) => {
  await authenticate(page);
  await page.route('**/api/v1/keys', route => route.fulfill({json:[]}));
  await page.goto('/#/settings?tab=system#api-keys');
  await expect(page.getByRole('tab', {name:'System',exact:true})).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#api-keys')).toBeVisible();
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole('tab', {name:'System',exact:true})).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/#\/settings\?tab=system#api-keys$/);
});

test('password reset token is read from the hash-route query', async ({page}) => {
  let submitted;
  await page.route('**/api/v1/auth/me', route => route.fulfill({status:401,json:{detail:'Not authenticated'}}));
  await page.route('**/api/v1/auth/reset-password', route => { submitted = route.request().postDataJSON(); return route.fulfill({status:204}); });
  await page.goto('/#/reset-password?token=e2e-test-token');
  await page.getByLabel('New password', {exact:true}).fill('temporary-test-password');
  await page.getByLabel('Confirm new password', {exact:true}).fill('temporary-test-password');
  await page.getByRole('button', {name:'Reset password',exact:true}).click();
  await expect.poll(() => submitted).toEqual({token:'e2e-test-token',password:'temporary-test-password'});
});

test('browser tab uses Courseo AI and the bundled Courseo logo favicon', async ({page, request}) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({status:401,json:{detail:'Not authenticated'}}));
  await page.goto('/#/');
  await expect(page).toHaveTitle('Courseo AI');
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('type', 'image/png');
  const href = await icon.getAttribute('href');
  expect(href).toMatch(/^\/assets\/courseo-logo-.*\.png$/);
  const response = await request.get(href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
  const { readFile } = await import('node:fs/promises');
  expect(await response.body()).toEqual(await readFile('src/assets/courseo-logo.png'));
});

for (const screen of ['profile','settings']) {
  test(`${screen} preference form PATCH matches update-langgraph-flow and preserves values after validation errors`, async ({page}) => {
    await authenticate(page);
    let reject = true;
    let submitted;
    await page.route('**/api/v1/auth/me', route => {
      if (route.request().method() !== 'PATCH') return route.fulfill({json:user});
      submitted = route.request().postDataJSON();
      expect(Object.keys(submitted).sort()).toEqual(['display_name','elective_interests']);
      if (reject) return route.fulfill({status:422,json:{detail:[{loc:['body','display_name'],type:'string_too_long',msg:'String should have at most 100 characters',ctx:{max_length:100}}]}});
      return route.fulfill({json:{...user,...submitted}});
    });
    await page.goto(`/#/${screen}`);
    const name = page.getByRole('textbox', {name:'Preferred name',exact:true});
    await expect(name).toBeEnabled();
    await name.fill('Correctable Student');
    await page.getByText('Interest-based', {exact:true}).click();
    await page.getByRole('button', {name:'Machine Learning',exact:true}).click();
    const save = page.getByRole('button', {name:screen === 'profile' ? 'Continue to secure setup' : 'Save changes',exact:true});
    await save.click();
    await expect(page.getByRole('alert')).toContainText('Preferred name: Use no more than 100 characters.');
    await expect(name).toHaveValue('Correctable Student');
    expect(submitted).toEqual({display_name:'Correctable Student',elective_interests:['Machine Learning']});
    reject = false;
    await save.click();
    if (screen === 'profile') await expect(page).toHaveURL(/#\/connect-key$/);
    else await expect(page.getByRole('button',{name:'Saved',exact:true})).toBeVisible();
  });
}

test('follow-up uses the available UI model instead of the saved obsolete model and exposes application 422 without retrying', async ({page}) => {
  await authenticate(page);
  await page.addInitScript(() => {
    const key = 'courseo:account:router-test:courseoChats';
    const chats = JSON.parse(localStorage.getItem(key));
    chats[0].backendSessionId = '00000000-0000-4000-8000-000000000001';
    chats[0].model = 'obsolete-model';
    localStorage.setItem(key,JSON.stringify(chats));
  });
  let calls = 0;
  await page.route('**/api/v1/chat/*', route => {
    calls += 1;
    const payload = route.request().postDataJSON();
    expect(payload.model).toBe('gemini-test');
    expect(payload).not.toHaveProperty('input_type');
    expect(payload.context.profile.elective_mode).toBe('degree');
    return route.fulfill({status:422,json:{detail:'Your AI provider does not offer the selected model for this key.'}});
  });
  await page.goto('/#/chat');
  const composer = page.getByRole('textbox',{name:'Message Courseo'});
  await expect(composer).toBeEnabled();
  await composer.fill('A test question');
  await page.getByRole('button',{name:'Send',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Choose another available model');
  await expect(composer).toHaveValue('A test question');
  expect(calls).toBe(1);
});
