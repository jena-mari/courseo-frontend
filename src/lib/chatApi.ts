import { api } from "./api";

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

export function startChat(enrolment: string) {
  return api<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ message: enrolment }),
  });
}

export function continueChat(sessionId: string, message: string) {
  return api<ChatResponse>(`/api/v1/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function getChatHistory(sessionId: string) {
  return api<{
    session_id: string;
    degree_code: string;
    messages: BackendMessage[];
  }>(`/api/v1/chat/${sessionId}`);
}
