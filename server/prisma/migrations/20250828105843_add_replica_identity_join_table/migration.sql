-- Ensure REPLICA IDENTITY is set to use the composite unique index
ALTER TABLE "_CourseSubject" REPLICA IDENTITY USING INDEX "_CourseSubject_AB_unique";
