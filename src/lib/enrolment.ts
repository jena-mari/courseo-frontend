export interface EnrolmentSubject {
  code: string;
  year: string;
  session: string;
  status: string;
  grade: string;
}

export interface EnrolmentSummary {
  current: EnrolmentSubject[];
  completed: EnrolmentSubject[];
}

export function parseEnrolmentSummary(raw: string): EnrolmentSummary {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = lines.map((line) =>
    line.includes("\t")
      ? line.split("\t").map((cell) => cell.trim())
      : line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())
  );
  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => /subject\s*code/i.test(cell)) && row.some((cell) => /status/i.test(cell))
  );
  if (headerIndex < 0) return { current: [], completed: [] };

  const header = rows[headerIndex].map((cell) => cell.toLowerCase().replace(/\s+/g, ""));
  const indexOf = (...names: string[]) => header.findIndex((cell) => names.includes(cell));
  const codeIndex = indexOf("subjectcode", "subject");
  const yearIndex = indexOf("year");
  const sessionIndex = indexOf("session");
  const statusIndex = indexOf("status");
  const gradeIndex = indexOf("grade");
  const parsed = rows.slice(headerIndex + 1)
    .filter((row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell)))
    .map((row) => ({
      code: row[codeIndex]?.toUpperCase() ?? "",
      year: row[yearIndex] ?? "",
      session: row[sessionIndex] ?? "",
      status: row[statusIndex] ?? "",
      grade: gradeIndex >= 0 ? row[gradeIndex] ?? "" : "",
    }))
    .filter((row) => /^[A-Z]{2,5}\d{3,4}$/.test(row.code));

  return {
    current: parsed.filter((row) => /enrolled|current/i.test(row.status)),
    completed: parsed.filter((row) => /complete|credit/i.test(row.status) && !/not\s*complete/i.test(row.status)),
  };
}

export function buildCopilotStudyPlanPrompt(raw: string, summary: EnrolmentSummary) {
  const format = (subject: EnrolmentSubject) =>
    `${subject.code} | ${subject.year} ${subject.session} | ${subject.status}${subject.grade ? ` | ${subject.grade}` : ""}`;
  return [
    "Create a UOW study plan using the confirmed enrolment summary below.",
    "Check prerequisites and do not invent subject codes. Ask concise follow-up questions when required.",
    "",
    "CURRENT ENROLMENTS",
    ...(summary.current.length ? summary.current.map(format) : ["None confirmed"]),
    "",
    "COMPLETED SUBJECTS",
    ...(summary.completed.length ? summary.completed.map(format) : ["None confirmed"]),
    "",
    "SOURCE RECORD",
    raw.trim(),
  ].join("\n");
}
