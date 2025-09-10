#!/usr/bin/env bash
set -euo pipefail

echo "==> Inserting additional students..."

for i in $(seq 16 25); do
  id=$(uuidgen)
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "INSERT INTO \"Student\"(id, first_name, courseId) VALUES ('$id', 'Name_$i', 'course_3');"
done

echo "==> Sleeping 5s to let PGSync finish previous batch..."
sleep 5

echo "==> Inserting second batch of additional students..."

for i in $(seq 16 25); do
  id=$(uuidgen)
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "INSERT INTO \"Student\"(id, first_name, courseId) VALUES ('additional_$id', 'Additional_$i', 'course_3');"
done


echo "==> Done. Check OpenSearch to see if subjects resolve or show [null, null]."
