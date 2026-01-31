import express from "express";
import cors from "cors";
import internshipsRouter from "./routes/internships";

const PORT = 8000;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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
