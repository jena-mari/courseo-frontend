//for study plan json
export interface Subject {
  code: string;
  name: string;
  cp: number;
  notes?: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeCreditPoints(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const normalized = typeof value === "number" ? value : Number(value.trim());
  return Number.isFinite(normalized) ? normalized : null;
}

/**
 * Validates and normalizes the backend/LLM plan shape for the card renderer.
 * Years and credit points may arrive as JSON strings or numbers; the UI always
 * receives a string year and numeric credit-point value.
 */
export function normalizeStudyPlanResponse(
  value: unknown
): StudyPlanResponse | null {
  if (!isRecord(value) || !Array.isArray(value.plan)) return null;

  const plan: YearPlan[] = [];

  for (const rawYear of value.plan) {
    if (!isRecord(rawYear) || !Array.isArray(rawYear.sessions)) return null;
    const year = normalizeText(rawYear.year);
    if (!year) return null;

    const sessions: SessionPlan[] = [];

    for (const rawSession of rawYear.sessions) {
      if (!isRecord(rawSession) || !Array.isArray(rawSession.subjects)) {
        return null;
      }
      const session = normalizeText(rawSession.session);
      if (!session) return null;

      const subjects: Subject[] = [];

      for (const rawSubject of rawSession.subjects) {
        if (!isRecord(rawSubject)) return null;
        const code = normalizeText(rawSubject.code);
        const name = normalizeText(rawSubject.name);
        const cp = normalizeCreditPoints(rawSubject.cp);
        if (!code || !name || cp === null) return null;

        const notes =
          rawSubject.notes === undefined || rawSubject.notes === null
            ? undefined
            : normalizeText(rawSubject.notes);
        if (rawSubject.notes != null && notes === null) return null;

        subjects.push({
          code,
          name,
          cp,
          ...(notes ? { notes } : {}),
        });
      }

      sessions.push({ session, subjects });
    }

    plan.push({ year, sessions });
  }

  return { plan };
}
