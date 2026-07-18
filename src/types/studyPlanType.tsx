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