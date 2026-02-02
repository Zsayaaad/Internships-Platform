import {
  createInternship,
  getInternshipsByCompanyId,
  getInternshipById,
  updateInternship,
  deleteInternship,
} from "./repository";
import { NewInternship } from "../../../db/schema/app";
import { getCompanyByUserId } from "../repository";

export class InternshipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternshipError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Create a new internship for a company
 */
export async function createInternshipService(
  userId: string,
  internshipData: {
    title: string;
    description?: string;
    requiredMajor: "CS" | "IT" | "IS" | "AI" | "DS";
    city: string;
    minGpa: string;
    capacity: number;
  },
) {
  // Get company profile
  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new InternshipError(
      "Company profile not found. Please complete your company profile first.",
    );
  }

  // Create internship
  const newInternship: NewInternship = {
    companyId: company.id,
    title: internshipData.title,
    description: internshipData.description || null,
    requiredMajor: internshipData.requiredMajor,
    city: internshipData.city,
    minGpa: internshipData.minGpa,
    capacity: internshipData.capacity,
    status: "active",
  };

  const internship = await createInternship(newInternship);
  return internship;
}

/**
 * Get all internships for a company user
 */
export async function getCompanyInternshipsService(userId: string) {
  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new InternshipError("Company profile not found");
  }

  const internships = await getInternshipsByCompanyId(company.id);
  return internships;
}

/**
 * Update an internship (only if owned by the company)
 */
export async function updateInternshipService(
  userId: string,
  internshipId: number,
  updateData: Partial<{
    title: string;
    description: string;
    requiredMajor: "CS" | "IT" | "IS" | "AI" | "DS";
    city: string;
    minGpa: string;
    capacity: number;
    status: "active" | "inactive" | "filled";
  }>,
) {
  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new InternshipError("Company profile not found");
  }

  const internship = await getInternshipById(internshipId);

  if (!internship) {
    throw new InternshipError("Internship not found");
  }

  if (internship.companyId !== company.id) {
    throw new UnauthorizedError(
      "You are not authorized to update this internship",
    );
  }

  const updated = await updateInternship(internshipId, updateData);
  return updated;
}

/**
 * Delete an internship (only if owned by the company)
 */
export async function deleteInternshipService(
  userId: string,
  internshipId: number,
) {
  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new InternshipError("Company profile not found");
  }

  const internship = await getInternshipById(internshipId);

  if (!internship) {
    throw new InternshipError("Internship not found");
  }

  if (internship.companyId !== company.id) {
    throw new UnauthorizedError(
      "You are not authorized to delete this internship",
    );
  }

  const deleted = await deleteInternship(internshipId);
  return deleted;
}
