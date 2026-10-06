import type { StudyPlanResponse } from "../types/studyPlanType";

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.replace(/<[^>]+>/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").trim());

/** Recover only explicit subject rows; never invent missing course information. */
export function studyPlanFromTable(text: string): StudyPlanResponse | null {
  const plan: StudyPlanResponse = { plan: [] };
  let columns: string[] = [];
  let year = "";
  let session = "";
  for (const line of text.split("\n")) {
    if (!line.includes("|")) continue;
    const row = cells(line);
    if (row.every((cell) => /^:?-+:?$/.test(cell))) continue;
    if (row.some((cell) => /subject.*code/i.test(cell)) && row.some((cell) => /year/i.test(cell))) {
      columns = row.map((cell) => cell.toLowerCase()); year = ""; session = ""; continue;
    }
    if (!columns.length) continue;
    const get = (pattern: RegExp) => row[columns.findIndex((column) => pattern.test(column))] ?? "";
    year = get(/^year$/) || year;
    session = get(/session|semester|term/) || session;
    const code = get(/subject.*code|^code$/);
    const name = get(/subject.*name|^name$|^subject$/);
    const credit = get(/credit|^cp$|^nomcp$/);
    if (!year || !session || !code || !name || !/^\d+(?:\.\d+)?(?:\s*cp)?$/i.test(credit)) continue;
    let yearPlan = plan.plan.find((item) => item.year === year);
    if (!yearPlan) { yearPlan = { year, sessions: [] }; plan.plan.push(yearPlan); }
    let sessionPlan = yearPlan.sessions.find((item) => item.session === session);
    if (!sessionPlan) { sessionPlan = { session, subjects: [] }; yearPlan.sessions.push(sessionPlan); }
    const notes = get(/notes|status/);
    sessionPlan.subjects.push({ code, name, cp: parseFloat(credit), ...(notes ? { notes } : {}) });
  }
  return plan.plan.length ? plan : null;
}

export function studyPlanTable(plan: StudyPlanResponse): string {
  const escape = (value: string) => value.replace(/\|/g, "&#124;").replace(/[\r\n]+/g, " ");
  return ["| Year | Session | Subject Code | Subject Name | CP | Notes |", "| --- | --- | --- | --- | --- | --- |", ...plan.plan.flatMap((year) => year.sessions.flatMap((session) => session.subjects.map((subject) => `| ${escape(year.year)} | ${escape(session.session)} | ${escape(subject.code)} | ${escape(subject.name)} | ${subject.cp} | ${escape(subject.notes ?? "")} |`)))].join("\n");
}
