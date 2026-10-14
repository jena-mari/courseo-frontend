import { api } from "./api";

export interface WamResult {
  wam: string | null;
  total_credit_points: number;
}

/**
 * Calculates the WAM on the server from the raw record and adds the result to the
 * chat session. The record never goes through the chat/LLM path.
 */
export function calculateWam(sessionId: string, enrolmentRecord: string) {
  return api<WamResult>(`/api/v1/wam/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ enrolment_record: enrolmentRecord }),
  });
}

export function describeWam({ wam, total_credit_points }: WamResult) {
  return wam === null
    ? "None of your subjects have a final mark yet, so there is no WAM to calculate."
    : `Your UOW WAM is ${wam} across ${total_credit_points} credit points. WAMs are truncated, not rounded up, and this is a guide only.`;
}
