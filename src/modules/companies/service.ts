import { eq } from "drizzle-orm";
import { user } from "../../db/schema";
import { DuplicateEmailError, RegistrationError } from "../shared/errorHandler";
import { db } from "../../db";
import { RegisterCompanyDTO } from "./validation";
import { createAuthUser, createCompanyProfile } from "../shared/authService";

export async function registerCompany(data: RegisterCompanyDTO) {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new DuplicateEmailError();
  }

  // Create auth user
  const authUser = await createAuthUser(
    data.email,
    data.password,
    data.companyName,
    "company",
  );

  // Create company profile with rollback on failure
  try {
    await createCompanyProfile(authUser.id, {
      companyName: data.companyName,
    });
  } catch (error) {
    // Remove orphaned auth user to allow retries
    await db.delete(user).where(eq(user.id, authUser.id));
    throw new RegistrationError("Failed to create company profile");
  }

  return authUser;
}
