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

For local development, leave `VITE_API_BASE_URL` blank. Vite proxies requests from `/api` to the backend at `http://127.0.0.1:7777`.

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
