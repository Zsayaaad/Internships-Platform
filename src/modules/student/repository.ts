import { eq } from "drizzle-orm";
import { Student, students } from "../../db/schema";
import { db } from "../../db";

/**
 * Get student by user ID
 */
export async function getStudentByUserId(userId: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return student;
}

/**
 * Get student by ID
 */
export async function getStudentById(id: number) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  return student;
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  userId: string,
  data: Partial<Student>,
) {
  const [updated] = await db
    .update(students)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(students.userId, userId))
    .returning();

  return updated;
}
