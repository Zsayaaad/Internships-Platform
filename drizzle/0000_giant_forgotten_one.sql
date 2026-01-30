CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."internship_status" AS ENUM('active', 'inactive', 'filled');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"student_id" integer NOT NULL,
	"internship_id" integer NOT NULL,
	"wish_order" smallint NOT NULL,
	"application_status" "application_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "internships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"required_major" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"min_gpa" numeric(3, 2),
	"capacity" integer,
	"status" "internship_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "students_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"national_id" varchar(50) NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"gpa" numeric(3, 2) NOT NULL,
	"major" varchar(100) NOT NULL,
	"bio_text" text,
	"profile_views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_student_internship" ON "applications" USING btree ("student_id","internship_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_student_wish_order" ON "applications" USING btree ("student_id","wish_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_companies_email" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_students_national_id" ON "students" USING btree ("national_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_students_email" ON "students" USING btree ("email");