import { Request, Response } from "express";
import {
  searchStudentsService,
  viewStudentProfileService,
  getCompanyApplicationsService,
  runSelectionAlgorithmService,
  CompanyNotFoundError,
  StudentNotFoundError,
  UnauthorizedAccessError,
  InternshipNotFoundError,
  InternshipNotActiveError,
  NoApplicationsError,
} from "./service";

/**
 * GET /api/company/students/search - Search students with filters
 */
export async function searchStudentsController(req: Request, res: Response) {
  try {
    const { search, gpa, page = "1", limit = "10" } = req.query;

    const parsedFilters = {
      search: search,
      gpa: gpa,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await searchStudentsService(req.user.id, parsedFilters);

    return res.status(200).json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Search students error:", error);

    if (error instanceof CompanyNotFoundError) {
      return res.status(404).json({
        error: "Company not found",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/company/students/:studentId - View student profile (increments view count)
 */
export async function viewStudentProfileController(
  req: Request,
  res: Response,
) {
  try {
    const studentIdParam = req.params.studentId;

    if (!studentIdParam || typeof studentIdParam !== "string") {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const studentId = Number.parseInt(studentIdParam, 10);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const student = await viewStudentProfileService(req.user.id, studentId);

    return res.status(200).json({
      student,
    });
  } catch (error) {
    console.error("View student profile error:", error);

    if (error instanceof CompanyNotFoundError) {
      return res.status(404).json({
        error: "Company not found",
        message: error.message,
      });
    }

    if (error instanceof StudentNotFoundError) {
      return res.status(404).json({
        error: "Student not found",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/company/applications - Get all applications for company's internships
 */
export async function getCompanyApplicationsController(
  req: Request,
  res: Response,
) {
  try {
    const {
      major,
      city,
      minGpa,
      bioKeyword,
      page = "1",
      limit = "10",
    } = req.query;

    const parsedFilters = {
      major: major,
      city: city,
      minGpa: minGpa ? parseFloat(minGpa as string) : undefined,
      bioKeyword: bioKeyword,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await getCompanyApplicationsService(
      req.user.id,
      parsedFilters,
    );

    return res.status(200).json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get company applications error:", error);

    if (error instanceof CompanyNotFoundError) {
      return res.status(404).json({
        error: "Company not found",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * POST /api/company/internships/:internshipId/run-selection - Run selection algorithm
 */
export async function runSelectionAlgorithmController(
  req: Request,
  res: Response,
) {
  try {
    const internshipIdParam = req.params.internshipId;

    if (!internshipIdParam || typeof internshipIdParam !== "string") {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    const internshipId = Number.parseInt(internshipIdParam, 10);
    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    const result = await runSelectionAlgorithmService(
      req.user.id,
      internshipId,
    );

    return res.status(200).json({
      message: "Selection algorithm completed successfully",
      result,
    });
  } catch (error) {
    console.error("Run selection algorithm error:", error);

    if (error instanceof CompanyNotFoundError) {
      return res.status(404).json({
        error: "Company not found",
        message: error.message,
      });
    }

    if (error instanceof InternshipNotFoundError) {
      return res.status(404).json({
        error: "Internship not found",
        message: error.message,
      });
    }

    if (error instanceof UnauthorizedAccessError) {
      return res.status(403).json({
        error: "Unauthorized",
        message: error.message,
      });
    }

    if (error instanceof InternshipNotActiveError) {
      return res.status(400).json({
        error: "Internship not active",
        message: error.message,
      });
    }

    if (error instanceof NoApplicationsError) {
      return res.status(400).json({
        error: "No applications",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}
