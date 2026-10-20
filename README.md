# Courseo Frontend

Courseo is the frontend for the University of Wollongong study plan generator. Paste a SOLS enrolment and receive handbook-aware study advice powered by an LLM.

The complete application uses two repositories:

- [Courseo frontend](https://github.com/jena-mari/courseo-frontend) — React, TypeScript, and Vite
- [IntelliStudy Planner Brain](https://github.com/ghimire007/intelli-study-planner-brain) — FastAPI, PostgreSQL, and Google Gemini

Both applications must be running at the same time during local development.

## Prerequisites

- Git
- Node.js `20.19+` or `22.12+`
- npm
- Python `3.12+`
- PostgreSQL, or access to a Supabase PostgreSQL database
- A Google Gemini API key

## Run the full application locally

### 1. Clone both repositories

Keep the repositories in the same parent directory so they can easily be run in separate terminals:

```bash
git clone https://github.com/ghimire007/intelli-study-planner-brain.git
git clone https://github.com/jena-mari/courseo-frontend.git
```

### 2. Set up and run the backend

Open the first terminal:

```bash
cd intelli-study-planner-brain

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.venv\Scripts\Activate.ps1
```

Edit the backend `.env` file and provide your database connection and Gemini API key:

```env
DATABASE_URL=postgresql+psycopg_async://user:password@host/database
APP_PORT=7777
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-001
```

Apply the database migrations, seed the handbook data, and start the API:

```bash
make migrate-up
python -m seeds.seed
make run-dev
```

The backend should now be available at:

| URL | Description |
| --- | --- |
| <http://localhost:7777> | Backend application |
| <http://localhost:7777/docs> | Interactive API documentation |

For more backend configuration and database commands, see the [backend README](https://github.com/ghimire007/intelli-study-planner-brain#readme).

### 3. Set up and run the frontend

Leave the backend running. Open a second terminal:

```bash
cd courseo-frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>.

For local development, set `VITE_API_URL=http://localhost:7777` in `.env.local` and open the frontend at `http://localhost:5173`. Use `localhost` consistently; do not mix it with `127.0.0.1`.

Set `AUTH_COOKIE_SECURE=false`, `AUTH_COOKIE_SAMESITE=lax`, and `CORS_ORIGINS=http://localhost:5173` in the backend `.env`, then restart it with `make run-dev` and sign in again. If your frontend uses another port, update `CORS_ORIGINS` to that exact origin. Keep production cookies configured for HTTPS (`AUTH_COOKIE_SECURE=true` and the appropriate SameSite setting).

Profile pages load account data from `GET /api/v1/auth/me` and save with `PATCH`. Both requests, and login, include session cookies. `VITE_API_BASE_URL` remains supported for existing deployments; `VITE_API_URL` takes precedence when set.

## Quick start on later runs

After completing the initial setup, start each application in its own terminal.

Terminal 1 — backend:

```bash
cd intelli-study-planner-brain
source .venv/bin/activate
make run-dev
```

Terminal 2 — frontend:

```bash
cd courseo-frontend
npm run dev
```

Then open <http://localhost:5173>.

## Production API configuration

If the frontend and backend are deployed at different origins, set the frontend environment variable to the public backend URL:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

Do not include a trailing slash. Rebuild the frontend after changing this value.

## Deployment (Render)

The frontend is deployed to Render as a static site. Every merge to `main` runs
`.github/workflows/deploy.yml`, which type-checks and builds the app, then triggers a
Render deploy and verifies that the public site serves the same commit. Pull requests run the build check only.

### One-time setup

1. In Render, choose **New → Blueprint**, point it at this repository, and apply
   `render.yaml`. This creates the `courseo-frontend` static site.
2. In the Render service settings, add the build-time environment variables:
   `VITE_API_BASE_URL` (the public backend URL, no trailing slash) and, if needed,
   `VITE_COPILOT_AGENT_URL`. These live in Render because `.env.local` is not committed
   and Render runs the real production build.
3. In Render, open **Settings → Deploy Hook** and copy the hook URL.
4. In GitHub, under **Settings → Secrets and variables → Actions**, add the repository
   secret `RENDER_DEPLOY_HOOK_URL` with that value. This is the only GitHub secret the
   pipeline needs — the CI build is a compile check and both Vite variables have safe
   fallbacks.

5. The live check defaults to `https://courseo-frontend.onrender.com`. Set the optional
   GitHub Actions **variable** `COURSEO_SITE_URL` to override it. The workflow checks `/version.json` for the deployed commit for up to
   20 minutes and fails if the new version never becomes live. Check Render's build
   logs when this step fails; a successful deploy hook only means the request was queued.
6. Apply the Blueprint changes to the existing Render service to activate the HTML
   revalidation headers. Hashed assets remain cached.

Account data in this browser is stored under account-specific keys. Legacy chat and
profile caches have no reliable owner, so they are not imported into any account.
AI warning acknowledgements persist through logout for each account in the same
browser, and Settings → System → View warning reopens the disclosure. Cross-device
acknowledgements require a backend preference; clearing browser data resets them.

Registration requires agreement to Courseo’s AI Policy. Selecting the policy link
or its unchecked checkbox opens the same AI disclosure used in chat. The user
must acknowledge the disclosure and select Agree and continue before the form
records agreement. Only successful registration saves that acknowledgement under
the returned account ID, so the first chat in this browser does not ask again.
Cancellation or a failed registration does not save an account acknowledgement.

`autoDeploy` is disabled in `render.yaml` so a deploy happens only after the GitHub Actions
build succeeds. A deploy can also be started manually from the **Actions** tab using the
workflow's **Run workflow** button.

## Frontend commands

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and create a production build
npm run preview  # Preview the production build locally
```

## Troubleshooting

- If the frontend cannot reach the planning service, confirm the backend is running on port `7777`.
- If the backend fails to start, check `DATABASE_URL` and `GEMINI_API_KEY` in its `.env` file.
- If migrations or seeding fail, confirm the PostgreSQL database exists and the configured user can create and modify tables.
- If port `5173` is already in use, Vite will normally choose another port and print its URL in the terminal.

## Local chat requests and progress

During Vite development, a loopback `VITE_API_URL` / `VITE_API_BASE_URL` is reached
through the same-origin `/api` proxy. `COURSEO_API_PROXY_TARGET` can override the
proxy destination; otherwise it uses the configured API URL and then the local
port 7777 default. Sign in again after switching between localhost and 127.0.0.1.
Production still uses the configured public API URL.

Chat starts and follow-ups use the `update-langgraph-flow` request contract:
`{ message, model?, context? }`. The obsolete `input_type` field is omitted.
Profile PATCH requests send only edited fields; `elective_mode` belongs in
`context.profile` for chat, and is not accepted by the profile endpoint.

The chat status panel follows actual request stages (sending, waiting for the
backend/AI response, receiving, formatting) and reports elapsed time. The JSON API
does not report internal tool progress, so the UI does not claim that a particular
handbook fetch or model operation is currently running.

## Frontend structure

`src/pages` contains route screens. `ChatPage.tsx` composes the chat workspace,
side panels, and overlays; its header, conversation, and composer live in
`src/components/chat`.

Components are grouped by responsibility:

- `components/chat`: chat header, conversation, composer, messages, and progress.
- `components/study-plan`: study-plan panel, subject cards, handbook popup, and PDF download.
- `components/account`: account management, API keys, privacy disclosure, and elective interests.
- `components/layout`: shared sidebar and background.
- `components/help`: instruction carousel.
- `components/ui`: shared loading indicators, loading screen, and update notice.

Chat behaviour lives in `src/features/chat`:

- `useChat.ts`: chat creation, sending, selection, deletion, storage, and workspace actions.
- `useChatAccess.ts`: API-key validation, model selection, and privacy acknowledgement.
- `useComposer.ts`: textarea sizing and resize-observer cleanup.
- `chatSession.ts`: saved-chat restoration, response parsing, message conversion, and titles.
- `types.ts` and `constants.ts`: chat data contracts and suggested prompts.

Keep network clients in `src/lib` and shared data contracts in `src/types`.
When changing chat behaviour, edit the relevant hook or helper; when changing its
appearance, edit the corresponding component. Import modules directly so their
ownership stays visible. Account storage keys and API request contracts remain
shared with the other route screens.

## Account actions, elective preferences, and pending integrations

Settings → System clears plans saved in this browser while preserving conversations.
An explicit `studyPlanCleared` flag prevents old assistant messages from rebuilding
cleared plans. A newly generated plan can replace a cleared plan. This action does
not delete backend conversation history; there is no plan-deletion endpoint in the
local backend.

Account deletion calls `DELETE /api/v1/auth/me` with `{ password }` and session cookies.
The local backend verifies the password, deletes the user and associated data,
purges provider keys and chat checkpoints, and clears its session cookie. After a
successful response the frontend clears the deleted account's browser data and
returns to login. Deploy that backend endpoint before using this frontend action.

Onboarding and Settings share `ElectiveInterestsField` and save `elective_interests`
through `PATCH /api/v1/auth/me`. Chat starts and continuations derive `elective_mode`
(`interest` for nonempty interests, otherwise `degree`) from the saved account
preferences and send it with the interests in `context.profile`. This integrates
the functional change from `origin/Tabitha` without its console payload logging.

The chat menu, sidebar, and Settings → System → View handbook all link to the
[general UOW School of Computing and Information Technology handbook](https://courses.uow.edu.au/browse/By%20School/SchoolofComputingandInformationTechnology).
The shared destination is defined in `src/lib/handbookLinks.ts`. These actions
previously used the profile's default course `766`, and the Settings dialog also
hard-coded its course label. Chat-confirmed course details are not exposed to
these controls, so the general page avoids opening an unrelated course. The
Settings dialog no longer requests course-specific API data from that default.
Restore personalised links only when the backend supplies reliable current
course, year, and campus details to the frontend. Subject-card links still open
individual subject pages.

The obsolete Add Enrolment / Update Enrolment chat-menu action has been removed
because it only returned to the welcome page. Paste enrolment records directly
into the chat composer instead.

Courseo tutorial slide 4 uses `src/assets/instructions/04-courseo.gif` to demonstrate creating and refining a plan.

WAM is deferred. The backend enrolment parser deliberately discards numeric marks,
so its current subject data cannot support a reliable WAM calculation. Future work
needs validated marks and credit-point weights, confirmed rules for repeated,
failed, and credited subjects, and a backend calculation/result contract before
adding a frontend WAM display. Grade bands should not be substituted for marks.

### Hash routing and refreshes

Courseo uses hash routing: open `/#/chat`, `/#/settings`, and `/#/login`.
The browser sends only `/` to the static host; React Router handles the fragment,
so refreshing a page works without a Render SPA rewrite. `render.yaml` retains
its optional rewrite for old clean-path links on hosts that apply that configuration.
Old `/chat` links can still return 404 on hosts without a rewrite. If an old link
reaches the app shell, Courseo converts it to a hash URL and preserves its query
parameters and anchors.

Password-reset email links must use `/#/reset-password?token=...`. The frontend
reads the token from that route; the backend email-link generator must produce
the new URL. Legacy `/reset-password?token=...` links still require a host rewrite
before frontend code can convert them. No backend changes are included here.

Deployment verification checks the revision and the app shell at the site root
for hash URLs. URL fragments are never sent to the server. Actual React routing
is exercised by the browser tests below.

### Router end-to-end tests

`npm run test:e2e` builds Courseo and tests direct hash-route navigation, full
reloads with a saved conversation, Settings queries and anchors, browser
back/forward, signed-out routing, and password-reset tokens in isolated Chromium.
The test server serves only real static files and intentionally returns 404 for
`/chat`, reproducing the deployment constraint without an SPA fallback.
Account and provider API responses are mocked; these tests verify frontend
routing and browser cache restoration, not backend availability.

On macOS the tests use installed Google Chrome; set `COURSEO_BROWSER_PATH` to
another Chromium executable if needed. On other systems run
`npx playwright install chromium` once.

Set `COURSEO_E2E_SITE_URL=https://courseo-frontend.onrender.com` when running
`npm run test:e2e` to also check the deployed `/#/chat` document and reload.
Full live verification of the new router requires deploying this commit first.
