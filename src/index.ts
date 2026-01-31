import express from "express";
import cors from "cors";
import internshipsRouter from "./routes/internships";

const PORT = 8000;
const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//   }),
// );
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

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Platform API" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
