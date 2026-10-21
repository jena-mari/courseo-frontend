/** General course browsing fallback until the chat supplies a valid UOW course code. */
export const GENERAL_HANDBOOK_URL = "https://courses.uow.edu.au/browse/By%20School/SchoolofComputingandInformationTechnology";

/**
 * UOW handbook course pages are addressed by handbook year and course code.
 * Use the course code captured by the chat. When its commencement year is
 * unavailable, link to the current handbook for that course.
 */
export function getCourseHandbookUrl(courseCode: string | null | undefined, commencementYear: number | null | undefined): string {
  const code = courseCode?.trim() ?? "";
  if (!/^\d{3,6}$/.test(code)) return GENERAL_HANDBOOK_URL;

  const currentYear = new Date().getFullYear();
  const year = typeof commencementYear === "number" && Number.isInteger(commencementYear) && commencementYear >= 2000 && commencementYear <= currentYear + 1
    ? commencementYear
    : currentYear;
  return `https://courses.uow.edu.au/courses/${year}/${encodeURIComponent(code)}`;
}
