import { Router } from "express";
import {
  createInternshipController,
  getCompanyInternshipsController,
  updateInternshipController,
  deleteInternshipController,
} from "./controller";
import { authenticateUser, requireRole } from "../../auth/shared/authService";

const router = Router();

// All routes require authentication and company role
router.use(authenticateUser, requireRole("company"));

// POST /internships - Create a new internship
router.post("/internships", createInternshipController);

// GET /internships - Get all internships for the company
router.get("/internships", getCompanyInternshipsController);

// PATCH /internships/:id - Update an internship
router.patch("/internships/:id", updateInternshipController);

// DELETE /internships/:id - Delete an internship
router.delete("/internships/:id", deleteInternshipController);

export default router;
