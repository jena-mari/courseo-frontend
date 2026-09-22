export type ChatPhase = "checking" | "sending" | "waiting" | "receiving" | "formatting";
export type ChatProgressListener = (phase: ChatPhase) => void;

export const CHAT_PHASES: Record<ChatPhase, { title: string; detail: string }> = {
  checking: { title: "Checking your AI connection", detail: "Loading your available models and saved key status." },
  sending: { title: "Sending your message", detail: "Preparing your message and selected model for Courseo." },
  waiting: { title: "Waiting for the backend and AI", detail: "Your request is in progress. Waiting for Courseo to return the AI response." },
  receiving: { title: "Receiving the response", detail: "Reading the reply returned by Courseo." },
  formatting: { title: "Preparing your reply", detail: "Formatting the response and checking for study-plan data." },
};
