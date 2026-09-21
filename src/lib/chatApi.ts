import { api } from "./api";

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

export function startChat(enrolment: string, model?: string, inputType: "enrolment" | "question" = "question") {
  return api<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ message: enrolment, input_type: inputType, ...(model ? { model } : {}) }),
  });
}

export function continueChat(sessionId: string, message: string, model?: string) {
  return api<ChatResponse>(`/api/v1/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ message, ...(model ? { model } : {}) }),
  });
}

export async function generateChatTitle(
  sessionId: string,
  model?: string
): Promise<string> {
  const response = await fetch(`/api/v1/chat/${sessionId}/title`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate title: ${response.statusText}`);
  }

  const data: { title: string } = await response.json();

  return data.title
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^[\s\"'`*_#-]+|[\s\"'`*_#-]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 48)
    .trim();
}

export function getChatHistory(sessionId: string) {
  return api<{
    session_id: string;
    degree_code: string;
    model: string | null;
    messages: BackendMessage[];
  }>(`/api/v1/chat/${sessionId}`);
}
