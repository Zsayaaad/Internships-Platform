import { InternshipError } from "../../auth/shared/errorHandler";
import { getStudentByUserId } from "../../student/repository";
import {
  getInternshipsByStudentId,
  getInternshipById,
  countStudentApplications,
  hasAppliedToInternship,
  createApplication,
  getStudentApplications,
} from "./repository";

export async function getEligibleInternshipsService(studentId: string) {
  const student = await getStudentByUserId(studentId);

  if (!student) {
    throw new InternshipError("Student profile not found");
  }

  const internships = await getInternshipsByStudentId(student.id); // Beware here i sent student id not user id
  return internships;
}

export async function applyToInternshipService(
  userId: string,
  internshipId: number,
  wishOrder: number,
) {
  // Get student profile
  const student = await getStudentByUserId(userId);
  if (!student) {
    throw new InternshipError("Student profile not found");
  }

  // Check if student has reached the 3 wishes limit
  const applicationCount = await countStudentApplications(student.id);
  if (applicationCount >= 3) {
    throw new InternshipError(
      "You have already submitted 3 applications. Maximum limit reached.",
    );
  }

  // Check if student already applied to this internship
  const alreadyApplied = await hasAppliedToInternship(student.id, internshipId);
  if (alreadyApplied) {
    throw new InternshipError("You have already applied to this internship");
  }

  // Check if internship exists and is active
  const internship = await getInternshipById(internshipId);
  if (!internship) {
    throw new InternshipError("Internship not found");
  }

  if (internship.status !== "active") {
    throw new InternshipError(
      "This internship is no longer accepting applications",
    );
  }

  // Validate eligibility (Major & GPA)
  if (internship.requiredMajor !== student.major) {
    throw new InternshipError(
      "You are not eligible for this internship. Major does not match.",
    );
  }

  const studentGpa = parseFloat(student.gpa);
  const minGpa = parseFloat(internship.minGpa);
  if (studentGpa < minGpa) {
    throw new InternshipError(
      `You are not eligible for this internship. Minimum GPA required: ${minGpa}`,
    );
  }

  // Create application
  const application = await createApplication(
    student.id,
    internshipId,
    wishOrder,
  );

  return application;
}

export async function getMyApplicationsService(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student) {
    throw new InternshipError("Student profile not found");
  }

  const applications = await getStudentApplications(student.id);
  return applications;
}
