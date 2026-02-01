import express from "express";
import cors from "cors";
import internshipsRouter from "./routes/internships";
import studentsRouter from "./modules/students/routes";
import companiesRouter from "./modules/companies/routes";
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

app.use("/api/internships", internshipsRouter);
// Custom auth routes (must come before better-auth catch-all)
app.use("/api/students", studentsRouter);
app.use("/api/companies", companiesRouter);

// Better-auth handler (catch-all for remaining auth routes)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Platform API" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
