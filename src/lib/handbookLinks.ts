/** General course browsing fallback until the chat supplies a valid UOW course code. */
export const GENERAL_HANDBOOK_URL = "https://courses.uow.edu.au/browse/By%20School/SchoolofComputingandInformationTechnology";

type ConversationMessage = { role?: string; content?: string };

/** Read only explicit course-code answers from the chat transcript. */
export function getCourseCodeFromConversation(messages: ConversationMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user" || typeof message.content !== "string") continue;
    const content = message.content.trim();

    const labeledCode = content.match(/\b(?:uow\s+)?(?:course|degree)(?:\s+(?:of\s+study|code|number))?\s*[:#-]?\s*(\d{3,6})\b/i);
    if (labeledCode) return labeledCode[1];

    // A bare number is accepted only as a direct answer to a course-code question.
    if (/^\d{3,6}$/.test(content)) {
      const previousAssistant = messages.slice(0, index).reverse().find((item) => item.role === "assistant");
      if (previousAssistant?.content && /\b(?:course|degree)\s+(?:code|number)\b|\bcourse\s+code\b/i.test(previousAssistant.content)) {
        return content;
      }
    }
  }
  return null;
}

export function isValidCourseCode(courseCode: string | null | undefined): courseCode is string {
  return /^\d{3,6}$/.test(courseCode?.trim() ?? "");
}

/**
 * UOW handbook course pages are addressed by handbook year and course code.
 * Use the course code captured by the chat. When its commencement year is
 * unavailable, link to the current handbook for that course.
 */
export function getCourseHandbookUrl(courseCode: string | null | undefined, commencementYear: number | null | undefined): string {
  const code = courseCode?.trim() ?? "";
  if (!isValidCourseCode(code)) return GENERAL_HANDBOOK_URL;

  const currentYear = new Date().getFullYear();
  const year = typeof commencementYear === "number" && Number.isInteger(commencementYear) && commencementYear >= 2000 && commencementYear <= currentYear + 1
    ? commencementYear
    : currentYear;
  return `https://courses.uow.edu.au/courses/${year}/${encodeURIComponent(code)}`;
}
