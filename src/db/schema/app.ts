import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  pgEnum,
  smallint,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

/* ======================
   ENUMS
====================== */
export const internshipStatusEnum = pgEnum("internship_status", [
  "active",
  "inactive",
  "filled",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

/* ======================
   STUDENTS
====================== */
export const students = pgTable(
  "students",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nationalId: varchar("national_id", { length: 50 }).notNull(),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    gpa: numeric("gpa", { precision: 3, scale: 2 }).notNull(),
    major: varchar("major", { length: 100 }).notNull(),
    bioText: text("bio_text"),
    profileViews: integer("profile_views").default(0),
    ...timestamps,
  },
  (t) => ({
    // prevents duplicates and can search faster
    nationalIdUnique: uniqueIndex("uq_students_national_id").on(t.nationalId),
    emailUnique: uniqueIndex("uq_students_email").on(t.email),
  }),
);

/* ======================
   COMPANIES
====================== */
export const companies = pgTable(
  "companies",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    companyName: varchar("company_name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    ...timestamps,
  },
  (t) => ({
    emailUnique: uniqueIndex("uq_companies_email").on(t.email),
  }),
);

/* ======================
   INTERNSHIPS
====================== */
export const internships = pgTable("internships", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  requiredMajor: varchar("required_major", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  minGpa: numeric("min_gpa", { precision: 3, scale: 2 }),
  capacity: integer("capacity"),
  status: internshipStatusEnum("status").default("active").notNull(),
  ...timestamps,
});

/* ======================
   APPLICATIONS
====================== */
export const applications = pgTable(
  "applications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    internshipId: integer("internship_id")
      .notNull()
      .references(() => internships.id, { onDelete: "cascade" }),
    wishOrder: smallint("wish_order").notNull(),
    status: applicationStatusEnum("application_status")
      .default("pending")
      .notNull(),
    ...timestamps,
  },
  (t) => ({
    uniqueStudentInternship: uniqueIndex("uq_student_internship").on(
      t.studentId,
      t.internshipId,
    ),

    uniqueWishOrder: uniqueIndex("uq_student_wish_order").on(
      t.studentId,
      t.wishOrder,
    ),
  }),
);

// TYPES INFERENCE FROM OUR DB SCHEMAS, TO STAY ALWAYS IN SYNC WITH DB SCHEMA
// (AUTO GENERATE TYPES)
export type Student = InferSelectModel<typeof students>;
export type NewStudent = InferInsertModel<typeof students>;

export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;

export type Internship = InferSelectModel<typeof internships>;
export type NewInternship = InferInsertModel<typeof internships>;

export type Application = InferSelectModel<typeof applications>;
export type NewApplication = InferInsertModel<typeof applications>;
