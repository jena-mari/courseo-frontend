export const STUDY_PLAN_STARTER = "Create a study plan for me.";
export const ENROLMENT_REQUEST = "To create your study plan, please copy and paste your enrolment record from SOLS, including the subject table. Remove your name, student number, and other personal identifiers before sending. You can find step-by-step instructions under Help.";

export function isStudyPlanStarter(message: string): boolean {
  return /^create\s+a\s+study\s+plan\s+for\s+me[.!?,]*$/i.test(message.trim());
}

/** Explain known record-validation failures without exposing pasted personal data. */
export function chatValidationMessage(path: string, detail: unknown): string | null {
  if (path !== "/api/v1/chat" || typeof detail !== "string") return null;
  if (!/enrolment|enrollment|subject (?:row|code)|readable.*history|advanced standing|table layout/i.test(detail)) return null;
  return "Courseo needs a readable SOLS enrolment record to start this chat. Paste the complete subject table with each row on its own line. Remove personal identifiers first; open Help for instructions.";
}
