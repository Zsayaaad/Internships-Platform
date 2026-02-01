import { Request, Response } from "express";
import { registerCompany } from "./service";
import { validateCompanyRegistration } from "./validation";
import { DuplicateEmailError, RegistrationError } from "../shared/errorHandler";

export async function registerCompanyController(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = validateCompanyRegistration(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Register company
    const user = await registerCompany(req.body);
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
