import type { CourseoUser } from "./authSession";

/** Hints from the signed-in account; the backend must resolve authoritative profile data. */
export interface ChatContext {
  profile: {
    degree_code: string | null;
    major: string | null;
    campus: string | null;
    commencement_year: number | null;
    elective_interests: string[];
  };
  enrolment_record?: string;
}

export function buildChatContext(user: CourseoUser | null, enrolment: string): ChatContext | undefined {
  if (!user) return undefined;
  return {
    profile: {
      degree_code: user.degreeCode || null,
      major: user.major || null,
      campus: user.campus || null,
      commencement_year: user.commencementYear ?? null,
      elective_interests: [...user.electiveInterests],
    },
    ...(enrolment.trim() ? { enrolment_record: enrolment.trim() } : {}),
  };
}
