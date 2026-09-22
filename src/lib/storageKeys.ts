/** Browser-storage keys owned by Courseo's frontend. */
export const STORAGE_KEYS = {
  authSession: "courseoAuthSession",
  user: "courseoUser",
  enrolment: "courseoEnrollment",
  chats: "courseoChats",
  bootstrapChat: "courseoBootstrapChat",
  pendingPrompt: "courseoPendingPrompt",
  profile: "courseoProfile",
  selectedModel: "courseoSelectedModel",
  llmPrivacyAcknowledged: "courseoLlmPrivacyAcknowledgedV1",
} as const;

const COURSE_STORAGE_KEYS = Object.values(STORAGE_KEYS);

/** Removes Courseo data without deleting unrelated data for the same origin. */
export function clearCourseoStorage() {
  for (const key of COURSE_STORAGE_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

/** Bind storage to a verified account. Never import legacy, unowned chat data. */
export function accountStorage(userId: string | null | undefined) {
  const keyFor = (key: string) => `courseo:account:${encodeURIComponent(userId!)}:${key}`;
  return {
    getItem(key: string): string | null {
      if (!userId) return null;
      const value = localStorage.getItem(keyFor(key));
      // The old acknowledgement is the only legacy value with a known owner.
      if (value === null && key === STORAGE_KEYS.llmPrivacyAcknowledged &&
          localStorage.getItem(key) === userId) return userId;
      return value;
    },
    setItem(key: string, value: string) {
      if (userId) localStorage.setItem(keyFor(key), value);
    },
    removeItem(key: string) {
      if (userId) localStorage.removeItem(keyFor(key));
    },
  };
}
