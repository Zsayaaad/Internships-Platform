import { db } from "../../db";
import {
  companies,
  students,
  applications,
  internships,
} from "../../db/schema";
import {
  eq,
  and,
  gte,
  or,
  sql,
  ilike,
  count,
  desc,
  getTableColumns,
  inArray,
} from "drizzle-orm";

/**
 * Get company by user ID
 */
export async function getCompanyByUserId(userId: string) {
  const [company] = await db
    .select() // Loses type information
    .from(companies)
    .where(eq(companies.userId, userId))
    .limit(1);

  return company;
}

/**
 * Search students with optional search, filters and pagination
 */
export async function searchStudents(filters: {
  search?: string;
  gpa?: string;
  page: number;
  limit: number;
}) {
  const currentPage = Math.max(1, +filters.page);
  const limitPerPage = Math.max(1, +filters.limit);

  // How many records to skip to get the next page
  const offset = (currentPage - 1) * limitPerPage;

  const filterConditions = [];

  // If search query exists, filter by major, city, GPA, or bio text
  if (filters.search) {
    filterConditions.push(
      // or() makes insensitive pattern match across multiple fields
      or(
        sql`CAST(${students.major} AS TEXT) ILIKE ${`%${filters.search}%`}`, // Cast enum to text
        ilike(students.city, `%${filters.search}%`), // %...% = Wildcard on BOTH sides
        ilike(students.bioText, `%${filters.search}%`),
      ),
    );
  }

  if (filters.gpa) {
    // const gpaValue = parseFloat(filters.gpa);
    if (filters.gpa) {
      filterConditions.push(or(gte(students.gpa, filters.gpa)));
    }
  }

  // Combine all filters with AND, In case pushing any other filters in filterConditions
  const whereClause =
    filterConditions.length > 0 ? and(...filterConditions) : undefined;

  // Get the count of all elements on page
  const countResult = await db
    .select({ count: count() })
    .from(students)
    .where(whereClause);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated students
  const studentsList = await db
    .select({
      ...getTableColumns(students), // Preserves type information
    })
    .from(students)
    .where(whereClause)
    .orderBy(desc(students.createdAt))
    .limit(limitPerPage)
    .offset(offset);

  return {
    data: studentsList,
    pagination: {
      page: currentPage,
      limit: limitPerPage,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitPerPage),
    },
  };
}

/**
 * Get student by ID
 */
export async function getStudentById(studentId: number) {
  const [student] = await db
    .select() // Loses type information
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  return student;
}

/**
 * Increment profile views for a student
 */
export async function incrementProfileViews(studentId: number) {
  const [updated] = await db
    .update(students)
    .set({
      profileViews: sql`${students.profileViews} + 1`,
    })
    .where(eq(students.id, studentId))
    .returning();

  return updated;
}

/**
 * Get application by ID with internship details
 */
export async function getApplicationById(applicationId: number) {
  const [application] = await db
    .select({
      applicationId: applications.id,
      studentId: applications.studentId,
      internshipId: applications.internshipId,
      wishOrder: applications.wishOrder,
      status: applications.status,
      companyId: internships.companyId,
    })
    .from(applications)
    .innerJoin(internships, eq(applications.internshipId, internships.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  return application;
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: number,
  status: "pending" | "accepted" | "rejected" | "withdrawn",
) {
  const [updated] = await db
    .update(applications)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId))
    .returning();

  return updated;
}

/**
 * Get applications for company's internships with filtering
 */
export async function getCompanyApplications(filters: {
  companyId: number;
  major?: string;
  city?: string;
  minGpa?: number;
  bioKeyword?: string;
  page: number;
  limit: number;
}) {
  const currentPage = Math.max(1, +filters.page);
  const limitPerPage = Math.max(1, +filters.limit);
  const offset = (currentPage - 1) * limitPerPage;

  /**
   * Input:
   * - companyId
   *
   * Processes: Get all apps related to company based on filtering
   * - first get all internIds related to this company
   * - get all apps from app table related to this internId
   * - once we have array of Apps, now we start filtering
   * -- make a filterCondition to push all conditions, if true push it
   * -- finally combine all condition in whereClause using and(...filterCondition)
   * - select from tables what u want to show in response
   * - make innerJoin between tables
   */

  // First get all internship IDs for this company
  const companyInternships = await db
    .select({ id: internships.id })
    .from(internships)
    .where(eq(internships.companyId, filters.companyId));

  const internshipIds = companyInternships.map((i) => i.id);

  // If company has no internships, return empty result
  if (internshipIds.length === 0) {
    return {
      data: [],
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Start with filtering only applications for this company's internships
  const filterConditions = [inArray(applications.internshipId, internshipIds)];

  if (filters.major) {
    filterConditions.push(
      // ilike(students.major, `%${filters.major}%`), // Error with drizzle cuz Enum syntax
      sql`CAST(${students.major} AS TEXT) ILIKE ${`%${filters.major}%`}`,
    );
  }

  if (filters.city) {
    filterConditions.push(ilike(students.city, `%${filters.city}%`));
  }

  if (filters.minGpa !== undefined) {
    filterConditions.push(gte(students.gpa, filters.minGpa.toString()));
  }

  if (filters.bioKeyword) {
    filterConditions.push(ilike(students.bioText, `%${filters.bioKeyword}%`));
  }

  // Combine all filters ==> AND (city match) AND (major match) or all match
  const whereClause = and(...filterConditions);

  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.id))
    .where(whereClause);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated applications with student and internship details
  const applicationsList = await db
    // I NEED TO ENHANCE THIS RESPONSE, MAKE IT CLEANER 👁️‍🗨️👁️‍🗨️👁️‍🗨️👁️‍🗨️
    .select({
      // Application fields
      applicationId: applications.id,
      wishOrder: applications.wishOrder,
      applicationStatus: applications.status,
      appliedAt: applications.createdAt,
      // Student fields
      studentId: students.id,
      studentName: students.fullName,
      studentEmail: students.nationalId,
      studentCity: students.city,
      studentGpa: students.gpa,
      studentMajor: students.major,
      studentBio: students.bioText,
      studentProfileViews: students.profileViews,
      // Internship fields
      internshipId: internships.id,
      internshipTitle: internships.title,
      internshipDescription: internships.description,
      internshipCity: internships.city,
      internshipMajor: internships.requiredMajor,
      internshipMinGpa: internships.minGpa,
      internshipCapacity: internships.capacity,
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.id))
    .innerJoin(internships, eq(applications.internshipId, internships.id))
    .where(whereClause)
    .orderBy(desc(applications.createdAt))
    .limit(limitPerPage)
    .offset(offset);

  return {
    data: applicationsList,
    pagination: {
      page: currentPage,
      limit: limitPerPage,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitPerPage),
    },
  };
}

/**
 * Get internship by ID
 */
export async function getInternshipById(internshipId: number) {
  const [internship] = await db
    .select()
    .from(internships)
    .where(eq(internships.id, internshipId))
    .limit(1);

  return internship;
}

/**
 * Get all applications for a specific internship with student details
 * (for selection algorithm)
 */
export async function getInternshipApplicationsForSelection(
  internshipId: number,
) {
  const applicationsList = await db
    .select({
      applicationId: applications.id,
      studentId: students.id,
      studentMajor: students.major,
      studentGpa: students.gpa,
      wishOrder: applications.wishOrder,
      status: applications.status,
      appliedAt: applications.createdAt,
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.id))
    .where(
      and(
        eq(applications.internshipId, internshipId),
        eq(applications.status, "pending"),
      ),
    )
    .orderBy(applications.createdAt); // Sort by application time

  return applicationsList;
}

/**
 * Bulk update application statuses
 */
export async function updateApplicationStatuses(
  updates: Array<{ applicationId: number; status: string }>,
) {
  const results = [];

  for (const update of updates) {
    const [result] = await db
      .update(applications)
      .set({
        status: update.status as
          | "pending"
          | "accepted"
          | "rejected"
          | "withdrawn",
        updatedAt: new Date(),
      })
      .where(eq(applications.id, update.applicationId))
      .returning();

    results.push(result);
  }

  return results;
}

/**
 * Update internship status to inactive
 */
export async function updateInternshipStatus(
  internshipId: number,
  status: "active" | "inactive",
) {
  const [updated] = await db
    .update(internships)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(internships.id, internshipId))
    .returning();

  return updated;
}
