import { Router } from "express";
import { registerStudentController } from "./controller";

const router = Router();

router.post("/register", registerStudentController);

export default router;
