import { api } from "./api";

export interface CourseHandbook {
  course: string;
  year: number;
  campus: string;
  title: string;
  information: string;
}

export function getCourseHandbook(course: string, year: number, campus: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ year: String(year), campus });
  return api<CourseHandbook>(`/api/v1/handbook/courses/${encodeURIComponent(course)}?${query}`, { signal });
}
