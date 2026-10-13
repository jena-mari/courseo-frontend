const LEGACY_ROUTES = new Set([
  "/chat", "/settings", "/login", "/register", "/profile", "/connect-key",
  "/forgot-password", "/reset-password",
]);

/** Preserve query strings and anchors when an old path reaches the app shell. */
export function legacyHashRoute(location: { pathname: string; search: string; hash: string }): string | null {
  if (!LEGACY_ROUTES.has(location.pathname)) return null;
  return `/#${location.pathname}${location.search}${location.hash}`;
}
