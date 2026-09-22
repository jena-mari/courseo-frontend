/** Use Vite's same-origin proxy for a local API, avoiding localhost/127.0.0.1 cookie and CORS mismatches. */
export function resolveApiBaseUrl(development: boolean, apiUrl?: string, legacyUrl?: string): string {
  const configured = (apiUrl?.trim() || legacyUrl?.trim() || "").replace(/\/+$/, "");
  if (development && configured) {
    try {
      const url = new URL(configured);
      if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return "";
    } catch { /* Relative paths are supported for same-origin deployments. */ }
  }
  return configured;
}
