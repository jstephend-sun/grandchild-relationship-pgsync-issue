#!/usr/bin/env bash
set -euo pipefail

echo "==> Sleeping 15s to let PGSync sync seeded docs..."
sleep 15

echo "==> Creating a new M2M record..."

PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "INSERT INTO \"Subject\"(id, name) VALUES ('subj_4', 'Algebra') ON CONFLICT (id) DO NOTHING;"
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "INSERT INTO \"Course\"(id, title) VALUES ('course_3', 'Basic Calculations') ON CONFLICT (id) DO NOTHING;"
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "INSERT INTO \"_Course_Subject\"(\"A\", \"B\") VALUES ('course_3', 'subj_1'), ('course_3', 'subj_4');"

echo "==> Inserting many new students with UUID ids..."

for i in $(seq 3 15); do
  id=$(uuidgen)  # generate unique UUID for each student id
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "INSERT INTO \"Student\"(id, first_name, courseId) VALUES ('$id', 'Name_$i', 'course_3');"
done 

echo "==> Finished batch insert..."
