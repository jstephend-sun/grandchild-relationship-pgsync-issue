#!/usr/bin/env bash
set -euo pipefail

echo "==> Sleeping 20s to let PGSync finish previous batch..."
sleep 20

echo "==> Inserting additional students..."
sleep 2

for i in $(seq 16 25); do
  id="stu_2_$i"
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "INSERT INTO \"Student\"(id, first_name, courseId) VALUES ('$id', 'Name_$i', 'course_3');"
done

echo "==> Done. Check OpenSearch to see if subjects resolve or show [null, null]."
