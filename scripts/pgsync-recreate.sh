#!/usr/bin/env bash
set -euo pipefail

PGSYNC_SERVICE="${PGSYNC_SERVICE:-pgsync}"
OS_URL="${OS_URL:-http://localhost:9200}"
INDEX="${INDEX:-students}"

echo "==> Build pgsync image (ensures curl/git/pgsync are baked)"
docker compose build "$PGSYNC_SERVICE"

echo "==> Stop pgsync (if running)…"
docker compose stop "$PGSYNC_SERVICE" >/dev/null || true

echo "==> Drop index ${INDEX} (ignore 404)"
curl -s -X DELETE "${OS_URL}/${INDEX}" >/dev/null || true

echo "==> Bootstrap (creates replication slot, validates schema)"
docker compose run --rm "$PGSYNC_SERVICE" sh -lc 'bootstrap --config /pgsync/schema.json'

echo "==> Run one-off sync"
docker compose run --rm "$PGSYNC_SERVICE" sh -lc 'pgsync --config /pgsync/schema.json'

echo "==> Sample doc:"
curl -s "${OS_URL}/${INDEX}/_search?size=1&pretty" || true
