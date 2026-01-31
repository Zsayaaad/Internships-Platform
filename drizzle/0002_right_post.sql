CREATE TYPE "public"."major" AS ENUM('CS', 'IT', 'IS', 'AI', 'DS');--> statement-breakpoint
ALTER TABLE "internships" ALTER COLUMN "required_major" SET DATA TYPE "public"."major" USING "required_major"::"public"."major";--> statement-breakpoint
ALTER TABLE "internships" ALTER COLUMN "capacity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "major" SET DATA TYPE "public"."major" USING "major"::"public"."major";