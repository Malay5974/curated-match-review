# Curated Match Review

Full-stack assessment prototype for The Date Crew.

Curated Match Review is an internal quality gate for matchmakers. It reviews a shortlisted set of profiles before they are shared with a client, flags avoidable risks, and keeps the final approve/remove decision with the matchmaker.

## What It Does

- Reviews profiles against client preferences and hard deal-breakers.
- Labels each profile as `Ready to Share`, `Review Needed`, or `High Risk`.
- Lets a matchmaker approve or remove a profile.
- Stores override notes and decisions in SQLite.
- Allows new profiles to be added and reviewed by the same backend rules.
- Includes a reset action so reviewers can replay the demo from a clean state.

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- SQLite through Node's built-in `node:sqlite`
- Local seeded data for the demo
- No LLM API key required

## Architecture

The backend is split in a Clean Code Architecture style:

```text
server/
  app.js                     Express app wiring
  index.js                   startup only
  config/                    paths, SQLite connection, schema migration
  controllers/               HTTP request/response handlers
  routes/                    Express route definitions
  use-cases/                 application workflows
  repositories/              database queries
  domain/                    profile review rules
  seed/                      demo client/profile data
```

SQL stays in `repositories/`, HTTP concerns stay in `controllers/`, workflows stay in `use-cases/`, and match review logic stays in `domain/`.

## Requirements

- Node.js 22 or newer
- npm

Node 22+ is required because the app uses `node:sqlite`. The SQLite CLI is optional.

## Setup

```bash
chmod +x setup.sh
./setup.sh
```

The setup script checks Node/npm, installs dependencies when needed, validates server syntax, builds the React app, and reports the database status.

## Run Locally

```bash
npm run dev
```

Open the Vite URL printed in the terminal. By default it is:

```text
http://127.0.0.1:5183/
```

The API runs on:

```text
http://127.0.0.1:5184/
```

Use the frontend URL in the browser. The API port is only for backend calls.

## Scripts

```bash
npm run dev           # run frontend and backend together
npm run server        # run only the Node API
npm run client        # run only the Vite frontend
npm run build         # build the React app
npm run check:server  # syntax-check all server files
npm run check         # server syntax check + frontend build
npm run start         # run the production server after build
```

## API

Get the review workspace:

```bash
curl http://127.0.0.1:5184/api/review
```

Save a decision:

```bash
curl -X POST http://127.0.0.1:5184/api/decisions/P-039 \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","overrideReason":"Strong values fit despite one flagged risk."}'
```

Reset demo data:

```bash
curl -X POST http://127.0.0.1:5184/api/reset
```

## CI/CD

GitHub Actions runs on every push and pull request to `main`.

The pipeline:

- installs dependencies with `npm ci`
- checks every server JavaScript file with `node --check`
- builds the React app with Vite
- starts the API and smoke-tests `/api/review` and `/api/reset`

Workflow file:

```text
.github/workflows/ci.yml
```

## Vercel Deployment

The app is Vercel-ready:

- `api/index.js` adapts the Express app to a Vercel Serverless Function.
- `vercel.json` routes `/api/*` to the backend and all other routes to the Vite app.
- On Vercel, the demo SQLite database is stored in `/tmp/curated-match-review`.

Deploy by importing this repository in Vercel:

```text
https://github.com/Malay5974/curated-match-review
```

Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 24.x
```

Note: the deployed SQLite database is demo-only because serverless file storage is ephemeral. For production, replace it with hosted Postgres such as Neon, Supabase or Vercel Postgres.

## Data

The local database is created automatically at:

```text
data/match-review.sqlite
```

It stores client preferences, shortlisted profiles, matchmaker decisions, override reasons, and timestamps. The database file is ignored by Git.

## Product Notes

The first version intentionally uses deterministic rules instead of an LLM for hard constraints such as smoking, alcohol, food preference, religion, and family setup. These checks need to be explainable and consistent.

In production, an LLM would be better used for lower-risk tasks: extracting structured preferences from notes, summarising rejection feedback, or normalising messy text. Full client and candidate profiles should not be sent to an LLM without consent, anonymisation, and a privacy review.

The next product layer would compare new shortlisted profiles against the client's historical accepted and rejected profiles. That would show whether the client behaves differently from their stated preferences and whether matchmaker overrides later lead to successful acceptance.

## Scope

This is not a client-facing dating app and not an AI replacement for matchmakers. It is a matchmaker-facing review tool for reducing avoidable rejections before profiles are sent to clients.

Out of scope for this prototype:

- authentication
- production deployment
- real profile integrations
- real LLM calls
- full profile search
- role-based permissions

## Troubleshooting

If dependencies are missing:

```bash
npm install
```

If a port is already in use, stop the old dev server and rerun:

```bash
npm run dev
```

If the database is in a bad demo state, use `Reset Demo` in the UI or call:

```bash
curl -X POST http://127.0.0.1:5184/api/reset
```
