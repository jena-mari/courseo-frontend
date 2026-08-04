import { setServiceHealth } from "./serviceHealth";

// A relative default uses Vite's /api development proxy and supports same-origin
// production deployments. Set VITE_API_BASE_URL only when the API has its own origin.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export interface BackendMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  provider?: string | null;
  model?: string | null;
}

export interface ChatResponse {
  session_id: string;
  reply: BackendMessage;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    const message =
      "Courseo cannot reach the planning service. Check your connection and try again.";
    setServiceHealth("unavailable", message);
    throw new Error(message);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null) as
      | { detail?: unknown; message?: unknown }
      | null;
    const backendDetail = [error?.detail, error?.message]
      .find((value): value is string => typeof value === "string");
    const exhaustionText = `${backendDetail ?? ""} ${response.status}`;
    const quotaExhausted =
      response.status === 429 ||
      /quota|resource.?exhausted|api.?key|rate.?limit/i.test(exhaustionText);
    const message = quotaExhausted
      ? "The AI planning service quota is exhausted. Please try again later or ask an administrator to renew the API quota."
      : response.status >= 500
        ? "Courseo's planning service is temporarily unavailable. Please try again shortly."
        : backendDetail ?? `The request could not be completed (${response.status}).`;

    setServiceHealth("unavailable", message);
    throw new Error(message);
  }

  setServiceHealth(
    "operational",
    "All connected planning services are operational."
  );
  return response.json() as Promise<T>;
}

export function startChat(enrolment: string) {
  return request<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ message: enrolment }),
  });
}

export function continueChat(sessionId: string, message: string) {
  return request<ChatResponse>(`/api/v1/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function getChatHistory(sessionId: string) {
  return request<{
    session_id: string;
    degree_code: string;
    messages: BackendMessage[];
  }>(`/api/v1/chat/${sessionId}`);
}
