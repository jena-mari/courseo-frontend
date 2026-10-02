import type { StudyPlanResponse } from "../../types/studyPlanType";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  backendSessionId: string;
  title: string;
  messages: Message[];
  studyPlanData: StudyPlanResponse | null;
  model?: string;
}

export interface ExtractedAIContent {
  cleanText: string;
  studyPlanData: StudyPlanResponse | null;
}

