import { and, eq, or, gte, lte, count } from "drizzle-orm";
import { InternshipError } from "../../auth/shared/errorHandler";
import { internships, students, applications } from "../../../db/schema";
import { db } from "../../../db";

/**
 * Get Eligible Internships for Student -- Major matches & GPA >= minGpa
 */
export async function getInternshipsByStudentId(studentId: number) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    throw new InternshipError("Student profile not found");
  }

  return await db
    .select()
    .from(internships)
    .where(
      and(
        eq(internships.requiredMajor, student.major),
        lte(internships.minGpa, student.gpa),
        eq(internships.status, "active"),
      ),
    );
}

/**
 * Get internship by ID
 */
export async function getInternshipById(internshipId: number) {
  const [internship] = await db
    .select()
    .from(internships)
    .where(eq(internships.id, internshipId))
    .limit(1);

  return internship;
}

/**
 * Count student's current applications
 */
export async function countStudentApplications(studentId: number) {
  const result = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.studentId, studentId));

  return result[0]?.count || 0;
}

/**
 * Check if student already applied to this internship
 */
export async function hasAppliedToInternship(
  studentId: number,
  internshipId: number,
) {
  const [existing] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.studentId, studentId),
        eq(applications.internshipId, internshipId),
      ),
    )
    .limit(1);

  return !!existing;
}

/**
 * Create application
 */
export async function createApplication(
  studentId: number,
  internshipId: number,
  wishOrder: number,
) {
  const [application] = await db
    .insert(applications)
    .values({
      studentId,
      internshipId,
      wishOrder,
      status: "pending",
    })
    .returning();

  return application;
}

/**
 * Get all applications for a student
 */
export async function getStudentApplications(studentId: number) {
  return await db
    .select({
      id: applications.id,
      internshipId: applications.internshipId,
      wishOrder: applications.wishOrder,
      status: applications.status,
      createdAt: applications.createdAt,
      internshipTitle: internships.title,
      internshipDescription: internships.description,
      internshipCity: internships.city,
      internshipMajor: internships.requiredMajor,
      internshipMinGpa: internships.minGpa,
    })
    .from(applications)
    .innerJoin(internships, eq(applications.internshipId, internships.id)) // Show only students in BOTH tables
    .where(eq(applications.studentId, studentId))
    .orderBy(applications.wishOrder);
}
