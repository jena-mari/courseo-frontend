/** Browser-storage keys owned by Courseo's frontend. */
export const STORAGE_KEYS = {
  authSession: "courseoAuthSession",
  user: "courseoUser",
  enrolment: "courseoEnrollment",
  chats: "courseoChats",
  bootstrapChat: "courseoBootstrapChat",
  pendingPrompt: "courseoPendingPrompt",
  geminiKeyConfigured: "courseoGeminiKeyConfigured",
  profile: "courseoProfile",
} as const;

const COURSE_STORAGE_KEYS = Object.values(STORAGE_KEYS);

/** Removes Courseo data without deleting unrelated data for the same origin. */
export function clearCourseoStorage() {
  for (const key of COURSE_STORAGE_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}
