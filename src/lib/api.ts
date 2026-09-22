import { chatValidationMessage } from "./chatStart";

// A relative default uses Vite's /api development proxy and supports same-origin
// production deployments. Set VITE_API_BASE_URL only when the API has its own origin.
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function detailText(detail: unknown): string {
  if (typeof detail === "string") return detail.toLowerCase();
  if (!Array.isArray(detail)) return "";
  return detail
    .map((item) => typeof item === "object" && item && "msg" in item ? String((item as { msg: unknown }).msg) : "")
    .join(" ")
    .toLowerCase();
}

/** Keep server, provider, and validation internals out of user-facing copy. */
function errorMessage(path: string, detail: unknown, status: number): string {
  const text = detailText(detail);

  if (status === 401) {
    if (path.endsWith("/auth/login")) return "Your email or password is incorrect. Check both and try again.";
    if (/current password|password is incorrect/.test(text)) return "Your current password is incorrect. Check it and try again.";
    return "Your session has expired. Log in again to continue.";
  }
  if (status === 403) return "You don’t have permission to make that change.";
  if (status === 404) {
    if (/key|credential|provider/.test(text)) return "That saved API key could not be found. Refresh the page and try again.";
    return "We couldn’t find what you were looking for.";
  }
  if (status === 409) {
    if (/required|missing|no usable|connect/.test(text) && /key|credential|provider/.test(text)) return "Connect a valid API key to continue.";
    if (/invalid|reject|revok/.test(text) && /key|credential|provider/.test(text)) return "This API key appears to be invalid. Check it and try again.";
    if (/email|account|already|exist/.test(text)) return "An account with this email already exists. Try logging in instead.";
    return "That conflicts with information already saved to your account. Review it and try again.";
  }
  if (status === 422) return chatValidationMessage(path, detail) ?? "Check the information you entered and try again.";
  if (status === 429) return "Your AI provider is busy or its quota has been reached. Wait a moment or try another key.";
  if (status >= 500) return "Courseo is temporarily unavailable. Please try again in a few moments.";
  if (/invalid|expired/.test(text) && /reset|token/.test(text)) return "This password reset link is invalid or has expired. Request a new one.";
  if (/current password|password is incorrect/.test(text)) return "Your current password is incorrect. Check it and try again.";
  if (/email/.test(text) && /already|exist|registered/.test(text)) return "An account with this email already exists. Try logging in instead.";
  if (/api.?key|credential/.test(text) && /invalid|reject|verify/.test(text)) return "This API key appears to be invalid. Check it and try again.";
  return "We couldn’t complete that request. Check your information and try again.";
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
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new ApiError("Courseo took too long to respond. Please try again.", 0);
    }
    throw new ApiError("Courseo can’t reach the server. Check your connection and try again.", 0);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(errorMessage(path, error?.detail, response.status), response.status);
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
