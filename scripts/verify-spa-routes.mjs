export class SpaRouteError extends Error {}

/** Hash routes request the site root; fragments are handled only by the browser. */
export async function verifySpaRoutes(siteUrl, fetchPage = fetch) {
  for (const route of ['/chat', '/settings', '/login']) {
    const url = new URL(`/#${route}`, siteUrl);
    const response = await fetchPage(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    if (!response.ok || response.redirected) {
      throw new SpaRouteError(`Direct route ${route} returned HTTP ${response.status}${response.redirected ? ' with a redirect' : ''}. Ensure the site root serves index.html for hash routing.`);
    }
    const html = await response.text();
    if (!response.headers.get('content-type')?.includes('text/html') || !/<div\b[^>]*\bid=["']root["']/.test(html)) {
      throw new SpaRouteError(`Direct route ${route} did not serve the Courseo app shell. Check that the site root serves index.html.`);
    }
  }
}
