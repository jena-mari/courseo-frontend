export interface ValidationIssue { field: string; location: Array<string | number>; type: string; message: string }
const LABELS: Record<string, string> = {
  display_name: "Preferred name", email: "Email", password: "Password", current_password: "Current password",
  degree_code: "Degree code", commencement_year: "Commencement year", campus: "Campus", major: "Major",
  elective_interests: "Elective interests", elective_mode: "Elective recommendation method",
  message: "Message", model: "AI model", session_id: "Chat session", api_key: "API key", provider: "Provider", label: "Key label",
  token: "Reset token", context: "Chat context", profile: "Profile", enrolment_record: "Enrolment record",
};

/** Never carry FastAPI's `input`, arbitrary context, or echoed values into errors. */
export function validationIssues(detail: unknown): ValidationIssue[] {
  if (!Array.isArray(detail)) return [];
  return detail.flatMap((error) => {
    if (!error || !Array.isArray(error.loc)) return [];
    const parts = error.loc.filter((part: unknown) => part !== "body" && part !== "path" && part !== "query");
    const field = parts.map((part: unknown) => typeof part === "number" ? `item ${part + 1}` : LABELS[String(part)] ?? "Field").join(" → ") || "Request";
    const type = typeof error.type === "string" ? error.type : "invalid";
    let message = "Check this value and try again.";
    if (type === "extra_forbidden") message = "This field is not supported by the backend.";
    else if (type === "missing") message = "This field is required.";
    else if (type === "uuid_parsing" || type === "uuid_type") message = "This saved chat has an invalid session ID. Start a new chat.";
    else if (/^int_|^float_/.test(type)) message = "Enter a valid number.";
    else if (type === "literal_error" || type === "enum") message = "Choose one of the available options.";
    else if (type === "string_type") message = "Enter text instead of an empty or non-text value.";
    else if (type === "list_type") message = "This field must be a list.";
    else if (type === "string_too_short" || type === "string_too_long") {
      const limit = type === "string_too_short" ? error.ctx?.min_length : error.ctx?.max_length;
      const direction = type === "string_too_short" ? "at least" : "no more than";
      message = typeof limit === "number" ? `Use ${direction} ${limit} characters.` : "Check the length of this value.";
    } else if (/greater_than|less_than/.test(type)) message = "Enter a number within the allowed range.";
    const location = error.loc.map((part: unknown) => typeof part === "number" ? part : ["body", "path", "query"].includes(String(part)) || LABELS[String(part)] ? String(part) : "field");
    return [{ field, location, type, message }];
  });
}
