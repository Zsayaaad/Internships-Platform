import {
  getCompanyByUserId,
  searchStudents,
  getStudentById,
  incrementProfileViews,
  getCompanyApplications,
  getInternshipById,
  getInternshipApplicationsForSelection,
  updateApplicationStatuses,
  updateInternshipStatus,
} from "./repository";

export class CompanyNotFoundError extends Error {
  constructor(message: string = "Company profile not found") {
    super(message);
    this.name = "CompanyNotFoundError";
  }
}

export class StudentNotFoundError extends Error {
  constructor(message: string = "Student not found") {
    super(message);
    this.name = "StudentNotFoundError";
  }
}

export class ApplicationNotFoundError extends Error {
  constructor(message: string = "Application not found") {
    super(message);
    this.name = "ApplicationNotFoundError";
  }
}

export class UnauthorizedAccessError extends Error {
  constructor(message: string = "Unauthorized access to this application") {
    super(message);
    this.name = "UnauthorizedAccessError";
  }
}

export class InternshipNotFoundError extends Error {
  constructor(message: string = "Internship not found") {
    super(message);
    this.name = "InternshipNotFoundError";
  }
}

export class InternshipNotActiveError extends Error {
  constructor(message: string = "Internship is not active") {
    super(message);
    this.name = "InternshipNotActiveError";
  }
}

export class NoApplicationsError extends Error {
  constructor(message: string = "No pending applications for this internship") {
    super(message);
    this.name = "NoApplicationsError";
  }
}

/**
 * Search students with various filters
 */
export async function searchStudentsService(
  userId: string,
  filters: {
    search: any;
    gpa: any;
    page: number;
    limit: number;
  },
) {
  // Verify company exists
  const company = await getCompanyByUserId(userId);
  if (!company) {
    throw new CompanyNotFoundError();
  }

  // Search students with pagination
  const result = await searchStudents(filters);
  return result;
}

/**
 * Get student profile by ID and increment view count
 */
export async function viewStudentProfileService(
  userId: string,
  studentId: number,
) {
  // Verify company exists
  const company = await getCompanyByUserId(userId);
  if (!company) {
    throw new CompanyNotFoundError();
  }

  // Get student profile
  const student = await getStudentById(studentId);
  if (!student) {
    throw new StudentNotFoundError();
  }

  // Increment profile views
  const updatedStudent = await incrementProfileViews(studentId);

  return updatedStudent;
}

/**
 * Get applications for company's internships with filtering
 */
export async function getCompanyApplicationsService(
  userId: string,
  filters: {
    major?: any;
    city?: any;
    minGpa?: any;
    bioKeyword?: any;
    page: number;
    limit: number;
  },
) {
  // Verify company exists
  const company = await getCompanyByUserId(userId);
  if (!company) {
    throw new CompanyNotFoundError();
  }

  // Get applications with filtering
  const result = await getCompanyApplications({
    companyId: company.id,
    // unpacks all properties from filters and combines them with companyId into a single new object.
    ...filters,
  });

  return result;
}

/**
 * Update application status (accept/reject)
 */
// export async function updateApplicationStatusService(
//   userId: string,
//   applicationId: number,
//   status: "pending" | "accepted" | "rejected" | "withdrawn",
// ) {
//   const company = await getCompanyByUserId(userId);
//   if (!company) {
//     throw new CompanyNotFoundError();
//   }

//   const application = await getApplicationById(applicationId);
//   if (!application) {
//     throw new ApplicationNotFoundError();
//   }

//   // Verify this application belongs to this company's internship
//   if (application.companyId !== company.id) {
//     throw new UnauthorizedAccessError(
//       "You can only manage applications for your own internships",
//     );
//   }

//   // Update application status
//   const updated = await updateApplicationStatus(applicationId, status);
//   return updated;
// }

/**
 * Run selection algorithm for a specific internship
 * Calculates scores based on: wish order, major match, and contextual GPA
 */
export async function runSelectionAlgorithmService(
  userId: string,
  internshipId: number,
) {
  const company = await getCompanyByUserId(userId);
  if (!company) {
    throw new CompanyNotFoundError();
  }

  // Get internship and verify ownership
  const internship = await getInternshipById(internshipId);
  if (!internship) {
    throw new InternshipNotFoundError();
  }

  if (internship.companyId !== company.id) {
    throw new UnauthorizedAccessError(
      "You can only run selection for your own internships",
    );
  }

  // Check if internship is active
  if (internship.status !== "active") {
    throw new InternshipNotActiveError();
  }

  // Get all pending applications for this internship
  const applications =
    await getInternshipApplicationsForSelection(internshipId);

  if (applications.length === 0) {
    throw new NoApplicationsError();
  }

  // Define major clusters for partial matching
  const majorClusters = [
    ["CS", "IT", "IS"], // Software/Computing cluster
    ["AI", "DS"], // Data Science cluster
  ];

  function getMajorCluster(major: string): string[] | null {
    for (const cluster of majorClusters) {
      if (cluster.includes(major)) {
        return cluster;
      }
    }
    return null;
  }

  // Calculate min and max GPA for contextual scoring
  //   - Contextual GPA (percentile among THIS internship's applicants):
  //   * (student_gpa - min_gpa) / (max_gpa - min_gpa) * 50
  const gpas = applications.map((app) => parseFloat(app.studentGpa));
  // [ 2.8=>[10]   3.5=>[35]   3.1=>[21]   3.9[50]   2.5[0] ]
  const minGpa = Math.min(...gpas); // 2.5
  const maxGpa = Math.max(...gpas); // 3.9
  const gpaRange = maxGpa - minGpa; // 1.4

  // Calculate score for each application
  const scoredApplications = applications.map((app) => {
    let totalScore = 0;

    // 1. Wish Order Score (highest priority)
    // 1st wish: 100, 2nd wish: 50, 3rd wish: 25
    const wishOrderScore =
      app.wishOrder === 1 ? 100 : app.wishOrder === 2 ? 50 : 25;
    totalScore += wishOrderScore;

    // 2. Major Match Score (IN MY CODE LOGIC: ALL MATCH IN THIS PHASE)
    let majorMatchScore = 0;
    if (app.studentMajor === internship.requiredMajor) {
      // Exact match
      majorMatchScore = 50;
    } else {
      // Check for related majors in same cluster
      const studentCluster = getMajorCluster(app.studentMajor);
      const internshipCluster = getMajorCluster(internship.requiredMajor);
      if (
        studentCluster &&
        internshipCluster &&
        studentCluster === internshipCluster
      ) {
        majorMatchScore = 25;
      }
    }
    totalScore += majorMatchScore;

    // 3. Contextual GPA Score (0-50 based on percentile among applicants)
    let gpaScore = 0;
    if (gpaRange > 0) {
      const studentGpa = parseFloat(app.studentGpa);
      // ((student_gpa - min_gpa) / (max_gpa - min_gpa)) * 50;
      gpaScore = ((studentGpa - minGpa) / gpaRange) * 50;
    } else {
      // All applicants have same GPA
      gpaScore = 25; // Middle score
    }
    totalScore += gpaScore;

    return {
      ...app,
      scores: {
        wishOrder: wishOrderScore,
        majorMatch: majorMatchScore,
        gpa: gpaScore,
        total: totalScore,
      },
    };
  });

  // Sort by total score (descending), then by application time (ascending) for ties
  scoredApplications.sort((a, b) => {
    if (b.scores.total !== a.scores.total) {
      return b.scores.total - a.scores.total; // sorts numbers in descending order.
    }
    // If two scores equal, sort apps from oldest to newest
    return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
  });

  // Accept top N applications (N = capacity)
  const capacity = internship.capacity;
  // scoredApplications are sorted now
  const acceptedApps = scoredApplications.slice(0, capacity);
  const rejectedApps = scoredApplications.slice(capacity);

  // Prepare updates
  const updates = [
    ...acceptedApps.map((app) => ({
      applicationId: app.applicationId,
      status: "accepted",
    })),
    ...rejectedApps.map((app) => ({
      applicationId: app.applicationId,
      status: "rejected",
    })),
  ];

  // Execute updates
  await updateApplicationStatuses(updates);

  // Mark internship as inactive (selection complete)
  await updateInternshipStatus(internshipId, "inactive");

  return {
    internshipId,
    internshipTitle: internship.title,
    MinGpa: internship.minGpa,
    capacity,
    totalApplications: applications.length,
    accepted: acceptedApps.length,
    rejected: rejectedApps.length,
    acceptedApplications: acceptedApps.map((app) => ({
      applicationId: app.applicationId,
      studentId: app.studentId,
      wishOrder: app.wishOrder,
      scores: app.scores,
    })),
    rejectedApplications: rejectedApps.map((app) => ({
      applicationId: app.applicationId,
      studentId: app.studentId,
      wishOrder: app.wishOrder,
      scores: app.scores,
    })),
  };
}
