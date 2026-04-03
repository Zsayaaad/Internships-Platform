import { Router } from "express";
import {
  registerStudentController,
  signOutStudentController,
} from "./controller";
import { authenticateUser, requireRole } from "../shared/authService";

const router = Router();

router.post("/register", registerStudentController);
router.post(
  "/signout",
  authenticateUser,
  requireRole("student"),
  signOutStudentController,
);

export default router;
