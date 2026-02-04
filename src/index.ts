import express from "express";
import cors from "cors";
import internshipsRouter from "./routes/internships";
import authStudentRoute from "./modules/auth/students/routes";
import authCompanyRoute from "./modules/auth/companies/routes";
import internshipCompanyRoutes from "./modules/internships/company/routes";
import internshipStudentRoutes from "./modules/internships/student/routes";
import studentRoute from "./modules/student/routes";
import companyRoute from "./modules/company/routes";
// import authRouter from "./routes/auth";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const PORT = 8000;
const app = express();

const frontendOrigin = process.env.FRONTEND_URL;
if (!frontendOrigin) {
  throw new Error("FRONTEND_URL must be set to enable CORS");
}
app.use(
  cors({
    origin: frontendOrigin,
  }),
);

app.use(express.json());

// Internship routes
app.use("/api/internships", internshipsRouter);

// Custom auth routes (must come before better-auth catch-all)
// Auth routes for students and companies
app.use("/api/auth/student", authStudentRoute);
app.use("/api/auth/company", authCompanyRoute);

// Internship routes for companies and students
app.use("/api/company", internshipCompanyRoutes);
app.use("/api/student", internshipStudentRoutes);

// Student route
app.use("/api/student", studentRoute);

// Company route
app.use("/api/company", companyRoute);

// Better-auth handler (catch-all for remaining auth routes)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Platform API" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
