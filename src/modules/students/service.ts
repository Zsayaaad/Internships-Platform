import { db } from "../../db";
import { students, user } from "../../db/schema";
import { RegisterStudentDTO } from "./validation";
import { auth } from "../../lib/auth";
import { eq } from "drizzle-orm";

// better error handling
export class DuplicateEmailError extends Error {
  constructor(message = "Email already exists") {
    super(message);
    this.name = "DuplicateEmailError";
  }
}

export class DuplicateNationalIdError extends Error {
  constructor(message = "National ID already exists") {
    super(message);
    this.name = "DuplicateNationalIdError";
  }
}

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
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
  const result = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.fullName,
      role: "student",
    },
  });

  if (!result?.user) {
    throw new RegistrationError("Failed to create user account");
  }

  // Create student profile
  await db.insert(students).values({
    userId: result.user.id,
    nationalId: data.nationalId,
    fullName: data.fullName,
    city: data.city,
    gpa: data.gpa.toString(),
    major: data.major,
    bioText: data.bioText,
  });

  return result.user;
}
