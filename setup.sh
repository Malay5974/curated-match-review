#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Curated Match Review"
MIN_NODE_MAJOR=22

info() {
  printf "\033[1;34m[info]\033[0m %s\n" "$1"
}

ok() {
  printf "\033[1;32m[ok]\033[0m %s\n" "$1"
}

warn() {
  printf "\033[1;33m[warn]\033[0m %s\n" "$1"
}

fail() {
  printf "\033[1;31m[error]\033[0m %s\n" "$1"
  exit 1
}

cd "$(dirname "$0")"

info "Checking ${APP_NAME} setup..."

command -v node >/dev/null 2>&1 || fail "Node.js is missing. Install Node.js ${MIN_NODE_MAJOR}+ and rerun this script."
command -v npm >/dev/null 2>&1 || fail "npm is missing. Install npm with Node.js and rerun this script."

NODE_VERSION="$(node -v)"
NODE_MAJOR="$(printf "%s" "$NODE_VERSION" | sed 's/^v//' | cut -d. -f1)"

if [ "$NODE_MAJOR" -lt "$MIN_NODE_MAJOR" ]; then
  fail "Node.js ${NODE_VERSION} detected. This app uses node:sqlite, so please install Node.js ${MIN_NODE_MAJOR}+."
fi

ok "Node.js ${NODE_VERSION}"
ok "npm $(npm -v)"

if command -v sqlite3 >/dev/null 2>&1; then
  ok "sqlite3 $(sqlite3 --version | cut -d' ' -f1)"
else
  warn "sqlite3 CLI is not installed. The app can still run because it uses Node's built-in SQLite driver."
fi

if [ ! -f package.json ]; then
  fail "package.json not found. Run this script from the curated-match-review folder."
fi

if [ ! -d node_modules ]; then
  info "Installing npm dependencies..."
  npm install
else
  ok "node_modules already exists"
fi

info "Checking backend syntax..."
node --check server/index.js
ok "Backend syntax check passed"

info "Building React frontend..."
npm run build
ok "Frontend build passed"

if [ -f data/match-review.sqlite ]; then
  ok "SQLite database exists at data/match-review.sqlite"
else
  warn "SQLite database will be created and seeded on first server start."
fi

cat <<'NEXT_STEPS'

Setup complete.

Run the app:
  npm run dev

Open in browser:
  http://127.0.0.1:5183/

Useful checks:
  npm run build
  node --check server/index.js

Notes:
  - The React app runs on port 5183.
  - The Node API runs on port 5184.
  - In development, open 5183 in the browser. Port 5184 is only the API.
  - Decisions and override reasons are stored in data/match-review.sqlite.
NEXT_STEPS
