import { Request, Response } from "express";
import {
  updateStudent,
  getStudentProfile,
  StudentNotFoundError,
  UpdateProfileError,
} from "./service";
import { validateUpdateStudentProfile } from "./validations";

export async function updateStudentProfileController(
  req: Request,
  res: Response,
) {
  try {
    // Get user ID from session/auth
    const userId = req.user.id;

    // Validate request body
    const validation = validateUpdateStudentProfile(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Check if request body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "No data provided",
        message: "Please provide at least one field to update",
      });
    }

    // Update student profile
    const updatedStudent = await updateStudent(userId, req.body);

    return res.status(200).json({
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof StudentNotFoundError) {
      return res.status(404).json({
        error: "Student not found",
        message: error.message,
      });
    }

    if (error instanceof UpdateProfileError) {
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

export async function getStudentProfileController(req: Request, res: Response) {
  try {
    const userId = req.user.id;

    const student = await getStudentProfile(userId);

    return res.status(200).json({ student });
  } catch (error) {
    console.error("Get profile error:", error);

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
