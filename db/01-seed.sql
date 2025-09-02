INSERT INTO "Subject"(id, name)
VALUES
  ('subj_1','Math'),
  ('subj_2','Science'),
  ('subj_3','History');

INSERT INTO "Course"(id, title)
VALUES
  ('course_1', 'Intro to Math'),
  ('course_2', 'World History');

-- Link course_1 to Math & Science
INSERT INTO "_Course_Subject"("A","B") VALUES
  ('course_1','subj_1'),
  ('course_2','subj_2');

INSERT INTO "Student"(id, first_name, courseId)
VALUES
  ('stu_1', 'Alice', 'course_1'),
  ('stu_2', 'Bob', 'course_1');