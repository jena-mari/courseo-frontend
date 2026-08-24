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

export async function generateChatTitle(userMessage: string, assistantMessage: string) {
  const prompt = [
    "Create a concise, personalised title for this Courseo study-planning chat.",
    "Return only the title: 3 to 7 words, no quotes, no markdown, maximum 48 characters.",
    `Student: ${userMessage.slice(0, 1200)}`,
    `Courseo: ${assistantMessage.slice(0, 1200)}`,
  ].join("\n\n");
  const result = await startChat(prompt);
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
    messages: BackendMessage[];
  }>(`/api/v1/chat/${sessionId}`);
}

export function saveGeminiApiKey(apiKey: string) {
  return api<{ saved: boolean; restart_required: boolean }>(
    "/api/local/gemini-key",
    {
      method: "PUT",
      body: JSON.stringify({ apiKey }),
    }
  );
}
