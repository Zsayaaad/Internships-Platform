import { Router } from "express";
import {
  createInternshipController,
  getCompanyInternshipsController,
  updateInternshipController,
  deleteInternshipController,
} from "./controller";
import { authenticateUser, requireRole } from "../../auth/shared/authService";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// // Student routes (no role check, just authentication)
// router.get("/internships", getEligibleInternshipsController);

// Company routes (require company role)
router.post("/internships", requireRole("company"), createInternshipController);
router.get(
  "/internships",
  requireRole("company"),
  getCompanyInternshipsController,
);

router.patch(
  "/internships/:id",
  requireRole("company"),
  updateInternshipController,
);
router.delete(
  "/internships/:id",
  requireRole("company"),
  deleteInternshipController,
);

export default router;
