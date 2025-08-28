-- -- DB
-- CREATE DATABASE repro_meetsone;

-- \c repro_meetsone;

-- Tables
CREATE TABLE "Student" (
  id TEXT PRIMARY KEY
);

CREATE TABLE "Course" (
  id TEXT PRIMARY KEY,
  "studentId" TEXT UNIQUE REFERENCES "Student"(id) ON DELETE CASCADE
);

CREATE TABLE "Subject" (
  id TEXT PRIMARY KEY,
  category TEXT
);

-- Through table for many-to-many Course <-> Subject
CREATE TABLE "_Course_Subject" (
  "A" TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
  PRIMARY KEY ("A","B")
);

-- Seed
INSERT INTO "Student"(id) VALUES ('stu_1'), ('stu_2');

INSERT INTO "Course"(id, "studentId") VALUES
('course_1', 'stu_1'),
('course_2', 'stu_2');

INSERT INTO "Subject"(id, category) VALUES
('subj_1', 'math'),
('subj_2', 'science'),
('subj_3', 'history');

INSERT INTO "_Course_Subject"("A","B") VALUES
('course_1', 'subj_1'),
('course_1', 'subj_2'),
('course_2', 'subj_3');
