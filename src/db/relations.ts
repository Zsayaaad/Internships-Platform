import { relations } from "drizzle-orm";
import {
  applications,
  companies,
  internships,
  students,
  user,
  session,
  account,
} from "./schema";

/* STUDENTS */
export const studentsRelations = relations(students, ({ many, one }) => ({
  user: one(user, {
    fields: [students.userId],
    references: [user.id],
  }),
  applications: many(applications),
}));

/* COMPANIES */
export const companiesRelations = relations(companies, ({ many, one }) => ({
  user: one(user, {
    fields: [companies.userId],
    references: [user.id],
  }),
  internships: many(internships),
}));

/* INTERNSHIPS */
export const internshipsRelations = relations(internships, ({ many, one }) => ({
  company: one(companies, {
    fields: [internships.companyId], // FK
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

/* USER (Better Auth) */
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  student: one(students, {
    fields: [user.id],
    references: [students.userId],
  }),
  company: one(companies, {
    fields: [user.id],
    references: [companies.userId],
  }),
}));

/* SESSION (Better Auth) */
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

/* ACCOUNT (Better Auth) */
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
