# Curated Match Review

Full-stack prototype for The Date Crew product assessment.

This app demonstrates an internal quality-control workflow for matchmakers. A matchmaker reviews a shortlisted set of profiles before sharing them with a client. The backend checks each profile against known preferences and hard deal-breakers, then labels it as `Ready to Share`, `Review Needed`, or `High Risk`. The matchmaker makes the final approve/remove decision and can store an override reason.

## Stack

- React + Vite frontend
- Node.js + Express backend
- SQLite database using Node's built-in `node:sqlite`
- Mocked client/profile data seeded locally
- No LLM API key required

## Backend Structure

The backend is split using a small Clean Code Architecture style:

```text
server/
  app.js                     Express app wiring
  index.js                   startup only
  config/                    paths, SQLite connection and schema migration
  controllers/               HTTP request/response handlers
  routes/                    Express route definitions
  use-cases/                 application workflows
  repositories/              database queries
  domain/                    profile review rules
  seed/                      demo client/profile data
```

SQL lives in `repositories/`, route definitions live in `routes/`, HTTP concerns live in `controllers/`, and business workflows live in `use-cases/`.

## Why No LLM Key Is Required

The prototype uses deterministic backend rules for hard deal-breaker checks. This is intentional: smoking, food preference, alcohol use, religion and similar hard constraints should be explainable and reliable.

In production, an LLM could be added only for messy text tasks such as summarising rejection feedback or extracting reasons from matchmaker notes. Full client and candidate profiles should not be sent to an LLM without privacy review, consent and anonymisation.

## Requirements

- Node.js 22 or newer
- npm

SQLite CLI is optional. The app uses Node's built-in SQLite driver, so the database works even if the `sqlite3` command-line tool is not installed.

## Quick Setup

From this folder:

```bash
chmod +x setup.sh
./setup.sh
```

The setup script checks Node/npm, installs dependencies if needed, validates backend syntax, builds the React app and confirms the SQLite database status.

## Run Locally

```bash
npm run dev
```

Open the React app:

```text
http://127.0.0.1:5183/
```

The API runs separately on:

```text
http://127.0.0.1:5184/
```

Do not open the API port for normal development. Use the frontend URL for the browser UI.

## Useful Commands

Install dependencies:

```bash
npm install
```

Run the full dev app:

```bash
npm run dev
```

Run only the backend:

```bash
npm run server
```

Run only the frontend:

```bash
npm run client
```

Build the frontend:

```bash
npm run build
```

Start production server after build:

```bash
npm run start
```

## Data

The local SQLite database is stored at:

```text
data/match-review.sqlite
```

It is created and seeded automatically when the backend starts. It stores:

- client preferences and deal-breakers
- shortlisted profiles
- matchmaker approve/remove decisions
- override reasons
- decision timestamps

## API

Get client, reviewed profiles and saved decisions:

```bash
curl http://127.0.0.1:5184/api/review
```

Save a matchmaker decision:

```bash
curl -X POST http://127.0.0.1:5184/api/decisions/P-039 \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","overrideReason":"Strong values fit despite one flagged risk."}'
```

`action` must be either `approve` or `remove`.

## What To Test

1. Open the dashboard and confirm the client is `Malay Delwadiya`.
2. Use the filters: `All`, `Ready`, `Review`, `High Risk`.
3. Approve or remove a profile.
4. Add an override reason for a risky approved profile.
5. Refresh the browser and confirm the decision persists.
6. Check that `Removed Before Send` updates after removing a profile.
7. Use `Add Profile` to create a new shortlisted profile and see the backend review it.
8. Use `Reset Demo` to restore the original seeded profiles and clear decisions.

## How New Profiles Are Checked

When a reviewer adds a profile, the app sends structured fields to the Node API and stores them in SQLite. The backend immediately runs the same deterministic review rules used for seeded profiles:

- smoking must match the non-smoker deal-breaker
- alcohol must match the no-regular-alcohol preference
- food preference is checked against vegetarian preference
- religion is treated as a hard filter
- family setup and religiosity are treated as softer review signals

In a production version, AI would be most useful before this rule step: extracting structured fields from unstructured profile notes, normalising messy rejection feedback, and summarising why a profile might be risky. The final decision should still stay with the matchmaker.

## Future Layer: Acceptance & Rejection History

This prototype currently focuses on the first quality-control layer: checking a shortlisted profile against stated preferences and hard deal-breakers.

In the next iteration, I would add a behaviour-history layer that looks at past accepted and rejected profiles for the same client. That would help answer questions like:

- Does the client often reject profiles with this attribute?
- Has the client accepted similar profiles in the past despite stating a stricter preference?
- Which rejection reasons repeat most often?
- Are matchmaker overrides later validated by client acceptance?

A production schema could add a `match_history` table with client decisions, rejection reasons and profile snapshots. The review score could then combine hard-rule checks with historical acceptance/rejection patterns, while still leaving the final decision with the matchmaker.

## Prototype Scope

This is intentionally not a client-facing dating app and not an AI replacement for the matchmaker. It is a matchmaker-facing quality gate that catches avoidable rejection risks before profiles are shared with the client.

Out of scope for this prototype:

- authentication
- production deployment
- real profile integrations
- real LLM calls
- full search across the profile database
- role-based permissions

## Troubleshooting

If dependencies are missing:

```bash
npm install
```

If ports are already in use, stop the existing process or change the ports in:

- `package.json` for the Vite frontend
- `server/index.js` for the API

If the database gets into an unwanted state, stop the server and delete:

```text
data/match-review.sqlite
```

Then run the app again; the database will be recreated and seeded.
