#!/usr/bin/env bash
set -euo pipefail

# --- Config (override via env if needed) ---
PG_CONTAINER="${PG_CONTAINER:-repro_postgres}"
PGUSER="${PGUSER:-repro_meetsone}"
PGPASSWORD="${PGPASSWORD:-repro_meetsone}"
DB_NAME="${DB_NAME:-repro_meetsone}"

echo "==> Dropping & recreating database: $DB_NAME"
docker exec -e PGPASSWORD="$PGPASSWORD" -i "$PG_CONTAINER" \
  psql -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE);" \
  -c "CREATE DATABASE ${DB_NAME};"

echo "==> Running Prisma seed inside server/"
(
  cd server
  yarn prisma migrate deploy
  yarn prisma:gen
  yarn prisma:seed
)

echo "==> Done. ${DB_NAME} is reset & seeded."
