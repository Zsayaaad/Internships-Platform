import { Student } from "../../db/schema";
import { getStudentByUserId, updateStudentProfile } from "./repository";

export class StudentNotFoundError extends Error {
  constructor(message: string = "Student profile not found") {
    super(message);
    this.name = "StudentNotFoundError";
  }
}

export class UpdateProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpdateProfileError";
  }
}

export async function updateStudent(userId: string, data: Partial<Student>) {
  // Check if student exists
  const existingStudent = await getStudentByUserId(userId);
  if (!existingStudent) {
    throw new StudentNotFoundError();
  }

  // Update profile
  const updatedStudent = await updateStudentProfile(userId, data);

  if (!updatedStudent) {
    throw new UpdateProfileError("Failed to update profile");
  }

  return updatedStudent;
}

export async function getStudentProfile(userId: string) {
  const student = await getStudentByUserId(userId);

  if (!student) {
    throw new StudentNotFoundError();
  }

  return student;
}
