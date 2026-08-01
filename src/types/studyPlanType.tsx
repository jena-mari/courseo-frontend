//for study plan json
export interface Subject {
  code: string;
  name: string;
  cp: number;
  notes: string;
}

export interface SessionPlan {
  session: string;
  subjects: Subject[];
}

export interface YearPlan {
  year: string;
  sessions: SessionPlan[]
}

export interface StudyPlanResponse {
  plan: YearPlan[];
}

export function isStudyPlanResponse(value: unknown): value is StudyPlanResponse {
  if (!value || typeof value !== "object") return false;

  const plan = (value as { plan?: unknown }).plan;
  if (!Array.isArray(plan)) return false;

  return plan.every((year) => {
    if (!year || typeof year !== "object") return false;
    const candidate = year as { year?: unknown; sessions?: unknown };
    if (typeof candidate.year !== "string" || !Array.isArray(candidate.sessions)) {
      return false;
    }

    return candidate.sessions.every((session) => {
      if (!session || typeof session !== "object") return false;
      const sessionCandidate = session as {
        session?: unknown;
        subjects?: unknown;
      };
      if (
        typeof sessionCandidate.session !== "string" ||
        !Array.isArray(sessionCandidate.subjects)
      ) {
        return false;
      }

      return sessionCandidate.subjects.every((subject) => {
        if (!subject || typeof subject !== "object") return false;
        const subjectCandidate = subject as Partial<Subject>;
        return (
          typeof subjectCandidate.code === "string" &&
          typeof subjectCandidate.name === "string" &&
          typeof subjectCandidate.cp === "number" &&
          Number.isFinite(subjectCandidate.cp) &&
          typeof subjectCandidate.notes === "string"
        );
      });
    });
  });
}
