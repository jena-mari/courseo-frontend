import { api } from "./api";
import type { ChatProgressListener } from "./chatProgress";

export interface BackendMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  provider?: string | null;
  model?: string | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  cached_tokens?: number | null;
  cost_usd?: number | null;
}

export interface ChatResponse {
  session_id: string;
  reply: BackendMessage;
}

export function startChat(message: string, model?: string, onProgress?: ChatProgressListener) {
  return api<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ message, input_type: "question", ...(model ? { model } : {}) }),
  }, onProgress);
}

export function continueChat(sessionId: string, message: string, model?: string, onProgress?: ChatProgressListener) {
  return api<ChatResponse>(`/api/v1/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ message, ...(model ? { model } : {}) }),
  }, onProgress);
}

export function getChatHistory(sessionId: string) {
  return api<{
    session_id: string;
    degree_code: string;
    model: string | null;
    messages: BackendMessage[];
  }>(`/api/v1/chat/${sessionId}`);
}
