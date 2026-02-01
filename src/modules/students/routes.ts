import { Router } from "express";
import { registerStudentController } from "./controller";

const router = Router();

router.post("/register/student", registerStudentController);

export default router;
