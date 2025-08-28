-- AlterTable
ALTER TABLE "public"."_CourseSubject" ADD CONSTRAINT "_CourseSubject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_CourseSubject_AB_unique";

ALTER TABLE "public"."_CourseSubject" REPLICA IDENTITY USING INDEX "_CourseSubject_AB_pkey";
