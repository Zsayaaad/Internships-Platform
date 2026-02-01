import { Router } from "express";
import { registerCompanyController } from "./controller";

const router = Router();

router.post("/register", registerCompanyController);

export default router;
