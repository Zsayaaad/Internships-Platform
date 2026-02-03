import { Router } from "express";
import { authenticateUser } from "../../auth/shared/authService";
import {
  getEligibleInternshipsController,
  applyToInternshipController,
  getMyApplicationsController,
} from "./controller";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Student routes
router.get("/internships", getEligibleInternshipsController); // Get eligible internships
router.post("/internships/:internshipId/apply", applyToInternshipController); // Apply to internship
router.get("/applications", getMyApplicationsController); // Get my applications

export default router;
