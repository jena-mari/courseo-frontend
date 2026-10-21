/** Only use a course number supplied by the authenticated chat history API. */
export function isValidCourseCode(courseCode: string | null | undefined): courseCode is string {
  return /^\d{3,4}$/.test(courseCode?.trim() ?? "");
}

/** Returns a direct course handbook URL only when chat history has a valid code. */
export function getCourseHandbookUrl(courseCode: string | null | undefined, commencementYear: number | null | undefined): string | null {
  const code = courseCode?.trim() ?? "";
  if (!isValidCourseCode(code)) return null;

  const currentYear = new Date().getFullYear();
  const year = typeof commencementYear === "number" && Number.isInteger(commencementYear) && commencementYear >= 2000 && commencementYear <= currentYear + 1
    ? commencementYear
    : currentYear;
  return `https://courses.uow.edu.au/courses/${year}/${encodeURIComponent(code)}`;
}
