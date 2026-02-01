import { db } from "../../db";
import { students, companies } from "../../db/schema";
import { auth } from "../../lib/auth";
import { RegistrationError } from "./errorHandler";

interface StudentProfileData {
  nationalId: string;
  fullName: string;
  city: string;
  gpa: string;
  major: "CS" | "IT" | "IS" | "AI" | "DS";
  bioText: string;
}

interface CompanyProfileData {
  companyName: string;
}

export async function createAuthUser(
  email: string,
  password: string,
  name: string,
  role: "student" | "company",
) {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role,
    },
  });

  if (!result?.user) {
    throw new RegistrationError("Failed to create user account");
  }

  return result.user;
}

export async function createStudentProfile(
  userId: string,
  data: StudentProfileData,
) {
  await db.insert(students).values({
    userId,
    nationalId: data.nationalId,
    fullName: data.fullName,
    city: data.city,
    gpa: data.gpa,
    major: data.major,
    bioText: data.bioText,
  });
}

export async function createCompanyProfile(
  userId: string,
  data: CompanyProfileData,
) {
  await db.insert(companies).values({
    userId,
    companyName: data.companyName,
  });
}
