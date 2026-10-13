import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SpaRouteError, verifySpaRoutes } from '../scripts/verify-spa-routes.mjs';
const shell = '<html><body><div id="root"></div></body></html>';

test('deployment verification requests the root for hash-based chat, settings and login', async () => {
  const paths = [];
  await verifySpaRoutes('https://example.test', async (url, options) => {
    paths.push([url.pathname, url.hash]);
    assert.equal(options.cache, 'no-store');
    return new Response(shell, { headers: { 'content-type': 'text/html' } });
  });
  assert.deepEqual(paths, [['/', '#/chat'], ['/', '#/settings'], ['/', '#/login']]);
});
test('unavailable site root fails deployment with actionable diagnostics', async () => {
  await assert.rejects(verifySpaRoutes('https://example.test', async () => new Response('Not Found', {status:404})), (error) => error instanceof SpaRouteError && /\/chat.*404.*site root/.test(error.message));
});
test('a redirect to the homepage does not count as a working deep link', async () => {
  await assert.rejects(verifySpaRoutes('https://example.test', async () => {
    const response = new Response(shell, {headers:{'content-type':'text/html'}});
    Object.defineProperty(response, 'redirected', {value:true});
    return response;
  }), /with a redirect/);
});
test('a successful HTTP response must contain the app shell', async () => {
  for (const response of [new Response('Not Found'), new Response('<html>error</html>', {headers:{'content-type':'text/html'}})]) {
    await assert.rejects(verifySpaRoutes('https://example.test', async () => response), /app shell/);
  }
});
