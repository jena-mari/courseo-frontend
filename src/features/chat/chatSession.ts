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

  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const jsonMatch = originalText.match(jsonRegex);
  let studyPlanData: StudyPlanResponse | null = null;

  if (jsonMatch?.[1]) {
    try {
      const parsedPlan: unknown = JSON.parse(jsonMatch[1].trim());
      const normalizedPlan = normalizeStudyPlanResponse(parsedPlan);
      if (normalizedPlan) {
        studyPlanData = normalizedPlan;
      } else {
        console.warn("Ignored an assistant study plan with an invalid structure.");
      }
    } catch (error) {
      console.error("Failed to parse extracted Study Plan JSON:", error);
    }
  }

  return {
    cleanText: originalText.replace(jsonRegex, "").trim(),
    studyPlanData,
  };
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
          studyPlanData: chat.studyPlanData ?? null,
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

