import { api } from "./api";
import type { StudyPlanResponse } from "../types/studyPlanType";

export interface SavedStudyPlan {
  id: string;
  title: string;
  plan: StudyPlanResponse;
  created_at: string;
  updated_at: string;
}

export function listSavedStudyPlans() {
  return api<SavedStudyPlan[]>("/api/v1/plans");
}

export function saveStudyPlan(title: string, plan: StudyPlanResponse) {
  return api<SavedStudyPlan>("/api/v1/plans", {
    method: "POST",
    body: JSON.stringify({ title, plan }),
  });
}

export function updateSavedStudyPlan(id: string, changes: { title?: string; plan?: StudyPlanResponse }) {
  return api<SavedStudyPlan>(`/api/v1/plans/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
}

export function deleteSavedStudyPlan(id: string) {
  return api<void>(`/api/v1/plans/${encodeURIComponent(id)}`, { method: "DELETE" });
}
