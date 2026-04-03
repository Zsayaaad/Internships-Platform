import { Router } from "express";
import {
  registerCompanyController,
  signOutCompanyController,
} from "./controller";
import { authenticateUser, requireRole } from "../shared/authService";

const router = Router();

router.post("/register", registerCompanyController);
router.post(
  "/signout",
  authenticateUser,
  requireRole("company"),
  signOutCompanyController,
);

export default router;
