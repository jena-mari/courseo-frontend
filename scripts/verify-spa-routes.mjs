export class SpaRouteError extends Error {}

/** Direct requests must receive the app shell, without redirecting away from the route. */
export async function verifySpaRoutes(siteUrl, fetchPage = fetch) {
  for (const route of ['/chat', '/settings', '/login']) {
    const url = new URL(route, siteUrl);
    const response = await fetchPage(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    if (!response.ok || response.redirected) {
      throw new SpaRouteError(`Direct route ${route} returned HTTP ${response.status}${response.redirected ? ' with a redirect' : ''}. Configure the Render rewrite /* → /index.html (Rewrite, not Redirect).`);
    }
    const html = await response.text();
    if (!response.headers.get('content-type')?.includes('text/html') || !/<div\b[^>]*\bid=["']root["']/.test(html)) {
      throw new SpaRouteError(`Direct route ${route} did not serve the Courseo app shell. Check the Render rewrite /* → /index.html.`);
    }
  }
}
