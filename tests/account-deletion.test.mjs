import { after, afterEach, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const name of ['window', 'document', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'MutationObserver', 'localStorage', 'sessionStorage']) {
  globalThis[name] = dom.window[name];
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(performance.now()), 16);
globalThis.cancelAnimationFrame = clearTimeout;
const { MemoryRouter, Routes, Route } = await import('react-router-dom');
const { render, screen, fireEvent, waitFor, cleanup, act } = await import('@testing-library/react');
let server, AuthProvider, AccountManagement, ProtectedRoute, accountStorage, STORAGE_KEYS;
const user = { id: 'alice', email: 'alice@example.com', display_name: 'Alice', degree_code: '766', commencement_year: null, campus: null, major: null, elective_mode: 'degree', elective_interests: [], created_at: '2026-01-01' };
let requests, deletionResponse;
const originalFetch = globalThis.fetch;

before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, esbuild: { jsx: 'automatic' } });
  ({ AuthProvider } = await server.ssrLoadModule('/src/auth/AuthContext.tsx'));
  ({ AccountManagement } = await server.ssrLoadModule('/src/components/account/AccountManagementPopup.tsx'));
  ({ ProtectedRoute } = await server.ssrLoadModule('/src/auth/RouteGuards.tsx'));
  ({ accountStorage, STORAGE_KEYS } = await server.ssrLoadModule('/src/lib/storageKeys.ts'));
});
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
after(async () => { globalThis.fetch = originalFetch; await server?.close(); dom.window.close(); });

async function openDialog(response) {
  requests = [];
  deletionResponse = response;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, ...options });
    if (options.method === 'DELETE') return await deletionResponse();
    assert.ok(String(url).endsWith('/api/v1/auth/me'));
    return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  render(React.createElement(MemoryRouter, { initialEntries: ['/settings'] },
    React.createElement(AuthProvider, null,
      React.createElement(Routes, null,
        React.createElement(Route, { element: React.createElement(ProtectedRoute) },
          React.createElement(Route, { path: '/settings', element: React.createElement(AccountManagement, { onClose() {} }) })),
        React.createElement(Route, { path: '/login', element: React.createElement('p', null, 'Signed out') }),
        React.createElement(Route, { path: '/', element: React.createElement('p', null, 'Signed out') })) )));
  await screen.findByRole('dialog', { name: 'Account settings' });
  fireEvent.click(screen.getByRole('button', { name: 'Delete account', exact: true }));
  const dialog = screen.getByRole('alertdialog', { name: 'Delete your account?' });
  const input = dialog.querySelector('input');
  assert.equal(input.type, 'password');
  fireEvent.change(input, { target: { value: 'current-secret' } });
  return dialog;
}
const deletes = () => requests.filter((request) => request.method === 'DELETE');

test('successful deletion sends a cookie-authenticated DELETE, accepts 204, clears only the deleted account, and signs out', async () => {
  let jsonReads = 0;
  const dialog = await openDialog(() => {
    const response = new Response(null, { status: 204 });
    response.json = () => { jsonReads += 1; throw new Error('204 must not parse JSON'); };
    return response;
  });
  for (const key of Object.values(STORAGE_KEYS)) {
    accountStorage('alice').setItem(key, 'Alice data');
    accountStorage('bob').setItem(key, 'Bob data');
    sessionStorage.setItem(accountStorage('alice').keyFor(key), 'Alice session data');
  }
  localStorage.setItem('unrelated', 'keep');
  fireEvent.submit(dialog);
  await screen.findByText('Signed out');
  assert.equal(deletes().length, 1);
  assert.ok(deletes()[0].url.endsWith('/api/v1/auth/me'));
  assert.equal(deletes()[0].credentials, 'include');
  assert.deepEqual(JSON.parse(deletes()[0].body), { password: 'current-secret' });
  assert.equal(jsonReads, 0);
  assert.equal(localStorage.getItem(STORAGE_KEYS.user), null);
  for (const key of Object.values(STORAGE_KEYS)) {
    assert.equal(accountStorage('alice').getItem(key), null);
    assert.equal(sessionStorage.getItem(accountStorage('alice').keyFor(key)), null);
    assert.equal(accountStorage('bob').getItem(key), 'Bob data');
  }
  assert.equal(localStorage.getItem('unrelated'), 'keep');
});

for (const [status, expected] of [[400, /current password is incorrect/i], [422, /could not remove your stored API keys/i]]) {
  test(`${status} keeps the confirmation open, shows an error, and preserves authentication and cached data`, async () => {
    const dialog = await openDialog(() => new Response(JSON.stringify({ detail: 'private backend details' }), { status }));
    accountStorage('alice').setItem(STORAGE_KEYS.chats, 'saved chats');
    fireEvent.submit(dialog);
    assert.match((await screen.findByRole('alert')).textContent, expected);
    assert.ok(screen.getByRole('alertdialog'));
    assert.ok(localStorage.getItem(STORAGE_KEYS.user));
    assert.equal(accountStorage('alice').getItem(STORAGE_KEYS.chats), 'saved chats');
    assert.equal(screen.getByRole('button', { name: 'Permanently delete account' }).disabled, false);
    assert.equal(screen.queryByText('Signed out'), null);
    assert.ok(!screen.getByRole('alert').textContent.includes('private backend details'));
    for (const storage of [localStorage, sessionStorage]) {
      for (let index = 0; index < storage.length; index += 1) assert.ok(!storage.getItem(storage.key(index)).includes('current-secret'));
    }
  });
}

test('cancellation makes no deletion request and discards the entered password', async () => {
  await openDialog(() => { throw new Error('must not delete'); });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  assert.equal(screen.queryByRole('alertdialog'), null);
  assert.equal(deletes().length, 0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete account', exact: true }));
  assert.equal(screen.getByRole('alertdialog').querySelector('input').value, '');
  assert.ok(screen.getByRole('button', { name: 'Permanently delete account' }).disabled);
});

test('duplicate submissions are blocked synchronously and pending requests show a loading state', async () => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const dialog = await openDialog(() => pending);
  fireEvent.submit(dialog);
  fireEvent.submit(dialog);
  await waitFor(() => assert.equal(deletes().length, 1));
  assert.ok(screen.getByRole('button', { name: 'Deleting account…' }).disabled);
  assert.ok(screen.getByRole('button', { name: 'Cancel', exact: true }).disabled);
  assert.ok(dialog.querySelector('input').disabled);
  await act(async () => { finish(new Response(null, { status: 204 })); });
  await screen.findByText('Signed out');
});

test('an expired session clears authentication and follows the protected-route signed-out flow without deleting account caches', async () => {
  const dialog = await openDialog(() => new Response(JSON.stringify({ detail: 'Session expired' }), { status: 401 }));
  accountStorage('alice').setItem(STORAGE_KEYS.chats, 'saved chats');
  fireEvent.submit(dialog);
  await screen.findByText('Signed out');
  assert.equal(localStorage.getItem(STORAGE_KEYS.user), null);
  assert.equal(accountStorage('alice').getItem(STORAGE_KEYS.chats), 'saved chats');
});

test('confirmation traps keyboard focus and Escape cancels without a request', async () => {
  const dialog = await openDialog(() => { throw new Error('must not delete'); });
  const input = dialog.querySelector('input');
  const confirm = screen.getByRole('button', { name: 'Permanently delete account' });
  input.focus();
  fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
  assert.equal(document.activeElement, confirm);
  fireEvent.keyDown(confirm, { key: 'Tab' });
  assert.equal(document.activeElement, input);
  fireEvent.keyDown(input, { key: 'Escape' });
  assert.equal(screen.queryByRole('alertdialog'), null);
  assert.equal(deletes().length, 0);
});
