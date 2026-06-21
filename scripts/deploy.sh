#!/usr/bin/env bash
set -euo pipefail

echo "[deploy] Starting deploy script"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[deploy] WARNING: DATABASE_URL is not set. Skipping migrations."
  echo "[deploy] To run migrations automatically, set DATABASE_URL in the environment."
else
  echo "[deploy] Running migrations (drizzle-kit push)"
  npm run migrate
fi

echo "[deploy] Starting server"
exec node dist/index.cjs
