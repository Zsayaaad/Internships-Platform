import { Router } from "express";
import {
  updateStudentProfileController,
  getStudentProfileController,
} from "./controller";
import { authenticateUser } from "../auth/shared/authService";
// import { authenticateUser } from "../../lib/middleware"; // Uncomment when middleware is ready

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser); // Uncomment when middleware is ready

// Get current student profile
router.get("/profile", getStudentProfileController);

// Update student profile
router.put("/profile", updateStudentProfileController);

export default router;
