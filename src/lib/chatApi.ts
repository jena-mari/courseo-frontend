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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? `Request failed: ${response.status}`);
  }

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

export function saveGeminiApiKey(apiKey: string) {
  return request<{ saved: boolean; restart_required: boolean }>(
    "/api/local/gemini-key",
    {
      method: "PUT",
      body: JSON.stringify({ apiKey }),
    }
  );
}
