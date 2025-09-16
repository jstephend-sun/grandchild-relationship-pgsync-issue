#!/usr/bin/env bash
set -euo pipefail

echo "==> Waiting for Postgres..."
until PGPASSWORD=mre_meetsone psql -h postgres -U mre_meetsone -d mre_meetsone -c "SELECT 1" >/dev/null 2>&1; do
  sleep 2
done

echo "==> Waiting for OpenSearch..."
for i in {1..60}; do
  curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}" >/dev/null && break
  sleep 2
done

echo "==> Bootstrapping schema..."
bootstrap --config /pgsync/schema.json

echo "==> Starting streaming daemon..."
exec pgsync --config /pgsync/schema.json --daemon -v
