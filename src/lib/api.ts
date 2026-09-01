// A relative default uses Vite's /api development proxy and supports same-origin
// production deployments. Set VITE_API_BASE_URL only when the API has its own origin.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : null
      )
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return `Request failed: ${status}`;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Shared fetch wrapper for the Courseo API.
 * Always sends cookies (`credentials: "include"`) so HttpOnly session auth works.
 */
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(errorMessage(error?.detail, response.status), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface BackendHealth {
  state: "online" | "unauthorized" | "unavailable";
  latencyMs: number;
  checkedAt: Date;
  statusCode?: number;
}

/**
 * Probes an authenticated endpoint that depends on the running FastAPI app and
 * its startup-initialised database services. A 401 still proves the API is
 * reachable, but reports that the browser session is no longer authorised.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  const startedAt = performance.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    return {
      state: response.ok ? "online" : response.status === 401 ? "unauthorized" : "unavailable",
      latencyMs,
      checkedAt: new Date(),
      statusCode: response.status,
    };
  } catch {
    return {
      state: "unavailable",
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt: new Date(),
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
