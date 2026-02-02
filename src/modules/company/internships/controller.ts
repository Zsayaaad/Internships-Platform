import { Request, Response } from "express";
import {
  createInternshipService,
  getCompanyInternshipsService,
  updateInternshipService,
  deleteInternshipService,
  InternshipError,
  UnauthorizedError,
} from "./service";
import {
  validatePostingInternship,
  validateInternshipUpdate,
} from "./validations";
import { getInternshipById } from "./repository";

/**
 * POST /api/company/internships - Create a new internship
 */
export async function createInternshipController(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = validatePostingInternship(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    const { title, description, requiredMajor, city, minGpa, capacity } =
      req.body;

    const internship = await createInternshipService(req.user.id, {
      title,
      description,
      requiredMajor,
      city,
      minGpa,
      capacity,
    });

    return res.status(201).json({
      message: "Internship created successfully",
      internship,
    });
  } catch (error) {
    console.error("Create internship error:", error);

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Internship creation failed",
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
 * GET /api/company/internships - Get all internships for the company
 */
export async function getCompanyInternshipsController(
  req: Request,
  res: Response,
) {
  try {
    const internships = await getCompanyInternshipsService(req.user.id);

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
 * PATCH /api/company/internships/:id - Update an internship
 */
export async function updateInternshipController(req: Request, res: Response) {
  try {
    const id = req.params.id;
    // check on string cuz id has type string | string[] in Express.
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    // const internshipId = parseInt(id);
    // // if (isNaN(internshipId)) {
    // //   return res.status(400).json({ error: "Invalid internship ID" });
    // // }

    // Base 10 (decimal system) codeRabbit suggestion: will coerce values like "123abc" to 123
    const internshipId = Number.parseInt(id, 10);
    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    // Validate update data
    const validation = validateInternshipUpdate(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Check if internship exists
    const existingInternship = await getInternshipById(internshipId);
    if (!existingInternship) {
      return res.status(404).json({
        error: "Internship not found",
        message: `Internship with ID ${internshipId} does not exist`,
      });
    }

    const updateData = req.body;

    const internship = await updateInternshipService(
      req.user.id,
      internshipId,
      updateData,
    );

    return res.status(200).json({
      message: "Internship updated successfully",
      internship,
    });
  } catch (error) {
    console.error("Update internship error:", error);

    if (error instanceof UnauthorizedError) {
      return res.status(403).json({
        error: "Forbidden",
        message: error.message,
      });
    }

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Update failed",
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
 * DELETE /api/company/internships/:id - Delete an internship
 */
export async function deleteInternshipController(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    // const internshipId = parseInt(id);
    // // if (isNaN(internshipId)) {
    // //   return res.status(400).json({ error: "Invalid internship ID" });
    // // }

    const internshipId = Number.parseInt(id, 10); // codeRabbit suggestion
    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    await deleteInternshipService(req.user.id, internshipId);

    return res.status(200).json({
      message: "Internship deleted successfully",
    });
  } catch (error) {
    console.error("Delete internship error:", error);

    if (error instanceof UnauthorizedError) {
      return res.status(403).json({
        error: "Forbidden",
        message: error.message,
      });
    }

    if (error instanceof InternshipError) {
      return res.status(400).json({
        error: "Delete failed",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}
