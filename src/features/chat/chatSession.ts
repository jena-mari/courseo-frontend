import { studyPlanFromTable, studyPlanTable } from "../../lib/studyPlanResponse";
import { ApiError } from "../../lib/api";
import type { BackendMessage } from "../../lib/chatApi";
import { accountStorage, STORAGE_KEYS } from "../../lib/storageKeys";
import { normalizeStudyPlanResponse, type StudyPlanResponse } from "../../types/studyPlanType";
import type { ChatSession, Message, ExtractedAIContent } from "./types";

export function isProviderKeyError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  return [403, 409, 429].includes(error.status) || /api key|quota|rate limit|usage limit|billing|provider rejected/i.test(error.message);
}

export function buildChatTitle(session: ChatSession) {
  const firstUserMessage = session.messages.find((message) => message.role === "user");

  const content = firstUserMessage?.content ?? session.messages[0]?.content ?? "New chat";
  const normalized = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 42 ? `${normalized.slice(0, 42)}…` : normalized;
}

export function parseAIResponse(aiResponseText: unknown): ExtractedAIContent {
  const emptyResult: ExtractedAIContent = {
    cleanText: "",
    studyPlanData: null,
  };
  if (!aiResponseText) return emptyResult;

  let originalText = "";

  if (typeof aiResponseText === "string") {
    originalText = aiResponseText;
  } else if (typeof aiResponseText === "object" && aiResponseText !== null) {
    const obj = aiResponseText as Record<string, unknown>;
    if (typeof obj.text === "string") {
      originalText = obj.text;
    } else {
      return emptyResult;
    }
  }

  if (!originalText) return emptyResult;

  let cleanText = originalText;
  let studyPlanData: StudyPlanResponse | null = null;
  // Accept fenced JSON (any case or no language) and raw JSON responses.
  const candidates = [...originalText.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  for (const candidate of candidates) {
    try {
      const plan = normalizeStudyPlanResponse(JSON.parse(candidate[1]));
      if (plan?.plan.some((year) => year.sessions.some((session) => session.subjects.length))) {
        studyPlanData = plan;
        cleanText = cleanText.replace(candidate[0], "");
      }
    } catch { /* Other code blocks are ordinary message content. */ }
  }
  if (!studyPlanData) {
    try {
      const plan = normalizeStudyPlanResponse(JSON.parse(originalText));
      if (plan?.plan.some((year) => year.sessions.some((session) => session.subjects.length))) {
        studyPlanData = plan;
        cleanText = "";
      }
    } catch { /* A prose response may still contain a complete plan table. */ }
  }
  studyPlanData ??= studyPlanFromTable(cleanText);
  if (studyPlanData && !studyPlanFromTable(cleanText)) {
    cleanText = `${cleanText.trim()}\n\n${studyPlanTable(studyPlanData)}`;
  }
  return { cleanText: cleanText.trim(), studyPlanData };
}

export function toFrontendMessage(message: BackendMessage): Message {
  const parsed = parseAIResponse(message.content);

  return {
    id: String(message.id),
    role: message.role === "user" ? "user" : "assistant",
    content: parsed.cleanText,
    timestamp: new Date(message.created_at),
  };
}

export function loadInitialChats(storage: ReturnType<typeof accountStorage>): ChatSession[] {
  let savedChats: ChatSession[] = [];
  const savedChatsRaw = storage.getItem(STORAGE_KEYS.chats);

  if (savedChatsRaw) {
    try {
      const parsedChats = JSON.parse(savedChatsRaw) as ChatSession[];
      savedChats = parsedChats
        .filter((chat) => chat.backendSessionId)
        .map((chat) => ({
          ...chat,
          studyPlanData: chat.studyPlanData ?? [...chat.messages].reverse().filter((message) => message.role === "assistant").map((message) => parseAIResponse(message.content).studyPlanData).find(Boolean) ?? null,
          messages: chat.messages.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })),
        }));
    } catch {
      storage.removeItem(STORAGE_KEYS.chats);
    }
  }

  const bootstrapRaw = storage.getItem(STORAGE_KEYS.bootstrapChat);
  if (!bootstrapRaw) return savedChats;

  try {
    const bootstrap = JSON.parse(bootstrapRaw) as {
      sessionId: string;
      reply: BackendMessage;
    };
    const parsedReply = parseAIResponse(bootstrap.reply.content);
    const bootstrapChat: ChatSession = {
      id: bootstrap.sessionId,
      backendSessionId: bootstrap.sessionId,
      title: "My study plan",
      messages: [toFrontendMessage(bootstrap.reply)],
      studyPlanData: parsedReply.studyPlanData,
    };

    return [
      bootstrapChat,
      ...savedChats.filter(
        (chat) => chat.backendSessionId !== bootstrap.sessionId
      ),
    ];
  } catch {
    storage.removeItem(STORAGE_KEYS.bootstrapChat);
    return savedChats;
  }
}

