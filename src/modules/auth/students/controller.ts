import { Request, Response } from "express";
import { registerStudent, DuplicateNationalIdError } from "./service";
import { validateStudentRegistration } from "./validation";
import { DuplicateEmailError, RegistrationError } from "../shared/errorHandler";
import { signOutUser } from "../shared/authService";

export async function registerStudentController(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = validateStudentRegistration(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Register student
    const user = await registerStudent(req.body);
    return res.status(201).json({ userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle custom errors
    if (error instanceof DuplicateEmailError) {
      return res.status(409).json({
        error: "Email already exists",
        message: "An account with this email already exists",
      });
    }

    if (error instanceof DuplicateNationalIdError) {
      return res.status(409).json({
        error: "National ID already exists",
        message: "A student with this national ID is already registered",
      });
    }

    if (error instanceof RegistrationError) {
      return res.status(400).json({
        error: "Registration failed",
        message: error.message,
      });
    }

    // Database constraint violations (fallback)
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return res.status(409).json({
        error: "Duplicate entry",
        message: "This record already exists",
      });
    }

    // Unknown error
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * POST /api/auth/students/signout - Sign out student
 */
export async function signOutStudentController(req: Request, res: Response) {
  try {
    // Get token from session (attached by authenticateUser middleware)
    const sessionToken = req.session?.token;

    if (!sessionToken) {
      return res.status(401).json({
        error: "No active session",
        message: "You are not logged in",
      });
    }

    // Delete session from database
    await signOutUser(sessionToken);

    return res.status(200).json({
      message: "Successfully signed out",
    });
  } catch (error) {
    console.error("Sign out error:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to sign out",
    });
  }
}
