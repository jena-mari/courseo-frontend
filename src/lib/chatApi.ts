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

export function startChat(enrolment: string, model?: string) {
  return api<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ message: enrolment, ...(model ? { model } : {}) }),
  });
}

export function continueChat(sessionId: string, message: string, model?: string) {
  return api<ChatResponse>(`/api/v1/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ message, ...(model ? { model } : {}) }),
  });
}

export async function generateChatTitle(userMessage: string, assistantMessage: string, model?: string) {
  const prompt = [
    "Create a concise, personalised title for this Courseo study-planning chat.",
    "Return only the title: 3 to 7 words, no quotes, no markdown, maximum 48 characters.",
    `Student: ${userMessage.slice(0, 1200)}`,
    `Courseo: ${assistantMessage.slice(0, 1200)}`,
  ].join("\n\n");
  const result = await startChat(prompt, model);
  return String(result.reply.content)
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
