CREATE TABLE IF NOT EXISTS "Subject" (
  id          TEXT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Course" (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Student" (
  id          TEXT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  courseId    TEXT REFERENCES "Course"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "_Course_Subject" (
  "A" TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE
);

ALTER TABLE "_Course_Subject" ADD CONSTRAINT "_Course_Subject_AB_pkey" PRIMARY KEY ("A", "B");
ALTER TABLE "_Course_Subject" REPLICA IDENTITY USING INDEX "_Course_Subject_AB_pkey";