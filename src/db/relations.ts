import { relations } from "drizzle-orm";
import { applications, companies, internships, students } from "./schema";

/* STUDENTS */
export const studentsRelations = relations(students, ({ many }) => ({
  applications: many(applications),
}));

/* COMPANIES */
export const companiesRelations = relations(companies, ({ many }) => ({
  internships: many(internships),
}));

/* INTERNSHIPS */
export const internshipsRelations = relations(internships, ({ many, one }) => ({
  company: one(companies, {
    fields: [internships.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

/* APPLICATIONS */
export const applicationsRelations = relations(applications, ({ one }) => ({
  student: one(students, {
    fields: [applications.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [applications.internshipId],
    references: [internships.id],
  }),
}));
