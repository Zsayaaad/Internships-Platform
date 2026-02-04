import { eq, or, and, count } from "drizzle-orm";
import { db } from "../../../db";
import { internships, NewInternship } from "../../../db/schema";
import { getStudentByUserId } from "../../student/repository";
import { InternshipError } from "../../auth/shared/errorHandler";

/**
 * Create a new internship
 */
export async function createInternship(internshipData: NewInternship) {
  const [internship] = await db
    .insert(internships)
    .values(internshipData)
    .returning(); // give me back what i just inserted

  return internship;
}

/**
 * Get all internships for a company
 */
export async function getInternshipsByCompanyId(companyId: number) {
  return await db
    .select()
    .from(internships)
    .where(eq(internships.companyId, companyId));
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
 * Update internship
 */
export async function updateInternship(
  internshipId: number,
  data: Partial<NewInternship>,
) {
  const [internship] = await db
    .update(internships)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(internships.id, internshipId))
    .returning();

  return internship;
}

/**
 * Delete internship
 */
export async function deleteInternship(internshipId: number) {
  const [internship] = await db
    .delete(internships)
    .where(eq(internships.id, internshipId))
    .returning();

  return internship;
}

/**
 * Count internships by company and major
 */
export async function countInternshipsByCompanyAndMajor(
  companyId: number,
  major: "CS" | "IT" | "IS" | "AI" | "DS",
) {
  const [result] = await db
    .select({ count: count() })
    .from(internships)
    .where(
      and(
        eq(internships.companyId, companyId),
        eq(internships.requiredMajor, major),
      ),
    );

  return result?.count ?? 0;
}
