# Frontend integration with update-langgraph-flow

Authoritative source inspected: `intelli-study-planner-brain` branch
`origin/update-langgraph-flow`, commit `a358cfe811388e3acbc776a4994f5ce4ffa75b9c`.
Schemas: `app/schemas/auth.py`, `chat.py`, and `vault.py`; routes:
`app/api/v1/auth.py` and `chat.py`. No backend files were changed and no
validator-fix changes are required.

## Reproduced mismatch

Both onboarding and Settings sent the following extra field in a JSON
`PATCH /api/v1/auth/me`: `elective_mode: "interest"` (or `"degree"`).
The backend `ProfileUpdate` forbids extra fields and has no `elective_mode`.
A FastAPI TestClient probe using those actual branch schemas returned:

```json
{"detail":[{"loc":["body","elective_mode"],"msg":"Extra inputs are not permitted","type":"extra_forbidden","input":"interest"}]}
```

Removing that field passed schema validation. The probe exercises the real
schema boundary, with stub endpoints; it is not a running production application
or evidence of persistence/provider success.

## Corrected requests

Every request includes session cookies (`credentials: "include"`); JSON writes
use `Content-Type: application/json`. Configured base URLs ending in `/api/v1`
are normalized before appending endpoint paths, including in the dev proxy.

Profile preferences (PATCH `/api/v1/auth/me`):

```json
{"display_name":"Test Student","elective_interests":["AI"]}
```

Degree-based mode sends `elective_interests: []`. Unedited academic fields are
omitted rather than sent back as possibly stale/null values. Backend profile
responses have no `elective_mode`; the frontend derives it from saved interests.
Optional academic fields, where used, follow the schema: commencement year is
an integer or null; campus and major are strings or null; degree code is a string.
Omitting a field leaves it unchanged; explicit null is valid only for nullable
fields; empty strings are not replacements for null.

Chat (POST `/api/v1/chat`, or `/api/v1/chat/{session_id}` for follow-up):

```json
{
  "message":"Hello",
  "model":"an-available-model-from-the-provider-catalog",
  "context":{"profile":{"degree_code":"766","major":null,"campus":null,"commencement_year":null,"elective_mode":"interest","elective_interests":["AI"]}}
}
```

`model` and `context` can be omitted. `context.enrolment_record`, if included, is
a string. `input_type` was obsolete; the backend ignored it, so it was **not** the
cause of schema-level chat 422s, but it is now removed. This first-chat body
passed the actual branch schema probe. Follow-up `session_id` must be a UUID;
a synthetic invalid ID produced `loc: ["path", "session_id"]`, type
`uuid_parsing`. That is a diagnostic case, not proof that the user's IDs are wrong.

The branch also returns application-level 422 with string detail when an AI
provider does not offer the selected model. Follow-ups previously preferred the
old saved chat model over the UI selection; the UI-selected model now wins.
Without an actual chat error response, no particular chat 422 cause is confirmed.

Account deletion remains DELETE `/api/v1/auth/me` with
`{"password":"<current password>"}`. A 204 is accepted without JSON parsing;
400 means incorrect password; string-detail 422 means key-cleanup failure.
Array-detail 422 is field validation, e.g. password length. No real account was
deleted during verification.

## Error handling and verification limits

Validation arrays produce field-specific messages and sanitized location/type
metadata. Error objects never include the rejected `input`, arbitrary backend
context, or echoed secrets. String application errors use safe messages; provider
model and deletion cleanup failures are distinguished. Profile uses the shared
API client. Invalid requests are not automatically retried. Non-sensitive form
values remain editable after failure.

Unit/API-client tests mock HTTP responses. Browser tests use a production build
with mocked account/provider responses and check actual form submissions,
validation messages, retained values, and model selection. They do not prove that
production chat generation succeeds.

Live verification subsequently succeeded against `http://localhost:7777`.
The running `/openapi.json` returned 200 and confirmed the relevant profile/chat
schemas. An isolated test account received a session cookie after registration
(201). The old profile payload reproduced 422 with `body.elective_mode` /
`extra_forbidden`; the corrected profile PATCH returned 200. A new chat with
`message: "Hello"`, valid context, and the backend default model returned 201
with an assistant reply. A follow-up returned 200. Logout returned 204.
No account was deleted; the isolated account remains under
`courseo-integration-8785ebc574@example.invalid`.

This verifies the live authenticated API contract and basic chat generation,
not every account, selected model, or enrolment input. The previously reported
500 was not reproduced by these requests. Diagnosing a remaining 500 requires
its exact endpoint and redacted backend exception traceback.
The supplied deployed `/openapi.json` still returned HTTP 404 during inspection,
so deployed-backend verification remains separate from the local results.
