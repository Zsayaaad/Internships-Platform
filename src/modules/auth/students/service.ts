import { db } from "../../../db";
import { students, user } from "../../../db/schema";
import { RegisterStudentDTO } from "./validation";
import { eq } from "drizzle-orm";
import { DuplicateEmailError, RegistrationError } from "../shared/errorHandler";
import { createAuthUser } from "../shared/authService";
import { createStudentProfile } from "./repository";

export class DuplicateNationalIdError extends Error {
  constructor(message = "National ID already exists") {
    super(message);
    this.name = "DuplicateNationalIdError";
  }
}

export async function registerStudent(data: RegisterStudentDTO) {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new DuplicateEmailError();
  }

  // Check if national ID already exists
  const existingStudent = await db
    .select()
    .from(students)
    .where(eq(students.nationalId, data.nationalId))
    .limit(1);

  if (existingStudent.length > 0) {
    throw new DuplicateNationalIdError();
  }

  // Create auth user
  const authUser = await createAuthUser(
    data.email,
    data.password,
    data.fullName,
    "student",
  );

  // Create student profile with rollback on failure
  try {
    await createStudentProfile(authUser.id, {
      nationalId: data.nationalId,
      fullName: data.fullName,
      city: data.city,
      gpa: data.gpa.toString(),
      major: data.major,
      bioText: data.bioText,
    });
  } catch (error) {
    // Remove orphaned auth user to allow retries
    await db.delete(user).where(eq(user.id, authUser.id));
    throw new RegistrationError("Failed to create student profile");
  }

  return authUser;
}
