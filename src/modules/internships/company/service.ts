import { NewInternship } from "../../../db/schema";
import {
  InternshipError,
  UnauthorizedError,
} from "../../auth/shared/errorHandler";
import { getCompanyByUserId } from "../../company/repository";
import {
  createInternship,
  getInternshipsByCompanyId,
  getInternshipById,
  updateInternship,
  deleteInternship,
  countInternshipsByCompanyAndMajor,
} from "./repository";

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

  // Check if company already has 2 internships with the same requiredMajor
  const existingCount = await countInternshipsByCompanyAndMajor(
    company.id,
    internshipData.requiredMajor,
  );

  if (existingCount >= 2) {
    throw new InternshipError(
      `You have already posted 2 internships for ${internshipData.requiredMajor} major. Maximum limit reached.`,
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
    status: "active" | "inactive";
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
