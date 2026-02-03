import { Request, Response } from "express";
import { InternshipError } from "../../auth/shared/errorHandler";
import {
  getEligibleInternshipsService,
  applyToInternshipService,
  getMyApplicationsService,
} from "./service";
import { validateApplicationData } from "./validations";

/**
 * GET /api/student/internships - Display Eligible Internships (Student)
 */
export async function getEligibleInternshipsController(
  req: Request,
  res: Response,
) {
  try {
    const internships = await getEligibleInternshipsService(req.user.id);
    return res.status(200).json({
      internships,
      count: internships.length,
    });
  } catch (error) {
    console.error("Get internships error:", error);

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Failed to fetch internships",
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
 * POST /api/student/internships/:internshipId/apply - Apply to Internship
 */
export async function applyToInternshipController(req: Request, res: Response) {
  try {
    const internshipIdParam = req.params.internshipId;

    // Validate internshipId from params
    if (!internshipIdParam || typeof internshipIdParam !== "string") {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    const internshipId = Number(internshipIdParam);
    const { wishOrder } = req.body;

    // Validate request data
    const validation = validateApplicationData({ internshipId, wishOrder });
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    const application = await applyToInternshipService(
      req.user.id,
      internshipId,
      wishOrder,
    );

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply to internship error:", error);

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Application failed",
        message: error.message,
      });
    }

    // Handle unique constraint violations
    /**
     * error.message.includes("unique") is brittle. With Drizzle + Neon
     * database errors are wrapped with the underlying PostgreSQL error attached at error.cause.
     * Check the error code (Postgres 23505 for unique constraint violations) or constraint name when available.
     */
    const pgError = (error as any)?.cause;
    // if (error instanceof Error && error.message.includes("unique")) {
    if (pgError && typeof pgError === "object" && pgError.code === "23505") {
      return res.status(409).json({
        error: "Duplicate application",
        message:
          "You have already used this wish order or applied to this internship",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/student/applications - Get My Applications
 */
export async function getMyApplicationsController(req: Request, res: Response) {
  try {
    const applications = await getMyApplicationsService(req.user.id);
    return res.status(200).json({
      applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Failed to fetch applications",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}
