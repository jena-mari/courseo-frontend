/** Keep conversation history, but explicitly prevent plans being rebuilt from it. */
export function clearStudyPlansFromChats(raw: string): string {
  const chats = JSON.parse(raw);
  if (!Array.isArray(chats) || chats.some((chat) => !chat || typeof chat !== "object")) {
    throw new Error("Saved conversations could not be read. No plans were cleared.");
  }
  return JSON.stringify(chats.map((chat) => ({
    ...chat, studyPlanData: null, studyPlanCleared: true,
  })));
}

export function restoreSavedStudyPlan<T>(chat: { studyPlanCleared?: boolean; studyPlanData: T | null }, recover: () => T | null): T | null {
  return chat.studyPlanCleared ? null : chat.studyPlanData ?? recover();
}
