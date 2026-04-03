import express from "express";
import { Request, Response } from "express";
import { db } from "../db";
import { students, companies, user } from "../db/schema";
import { auth } from "../lib/auth";

const router = express.Router();

// Student Registration
router.post("/register/student", async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      nationalId,
      fullName,
      city,
      gpa,
      major,
      bioText,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !name ||
      !nationalId ||
      !fullName ||
      !city ||
      !gpa ||
      !major
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "email",
          "password",
          "name",
          "nationalId",
          "fullName",
          "city",
          "gpa",
          "major",
        ],
      });
    }

    // Validate GPA range
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) {
      return res.status(400).json({
        error: "GPA must be between 0 and 4.0",
      });
    }

    // Step 1: Create Better Auth user
    const signUpResponse = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: "student",
        }),
      },
    );

    if (!signUpResponse.ok) {
      const errorData = await signUpResponse.json();
      return res.status(signUpResponse.status).json({
        error: "Failed to create user account",
        details: errorData,
      });
    }

    const authUser = await signUpResponse.json();
    console.log(authUser);

    if (!authUser || !authUser.user || !authUser.user.id) {
      return res.status(500).json({
        error: "Invalid response from authentication service",
      });
    }

    try {
      // Step 2: Create student profile
      const [newStudent] = await db
        .insert(students)
        .values({
          userId: authUser.user.id,
          nationalId,
          fullName,
          city,
          gpa: gpaValue.toString(),
          major,
          bioText: bioText || null,
        })
        .returning();

      return res.status(201).json({
        message: "Student registered successfully",
        user: authUser.user,
        student: newStudent,
      });
    } catch (profileError) {
      // If student profile creation fails, we should ideally delete the auth user
      // For now, we'll return an error
      console.error("Failed to create student profile:", profileError);
      return res.status(500).json({
        error: "User account created but student profile failed",
        details: profileError,
      });
    }
  } catch (error) {
    console.error("Student registration error:", error);
    return res.status(500).json({
      error: "Internal server error during registration",
      details: error,
    });
  }
});

// Company Registration
router.post("/register/company", async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName } = req.body;

    // Validate required fields
    if (!email || !password || !name || !companyName) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "password", "name", "companyName"],
      });
    }

    // Step 1: Create Better Auth user
    const signUpResponse = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: "company",
        }),
      },
    );

    if (!signUpResponse.ok) {
      const errorData = await signUpResponse.json();
      return res.status(signUpResponse.status).json({
        error: "Failed to create user account",
        details: errorData,
      });
    }

    const authUser = await signUpResponse.json();
    if (!authUser || !authUser.user || !authUser.user.id) {
      return res.status(500).json({
        error: "Invalid response from authentication service",
      });
    }

    try {
      // Step 2: Create company profile
      const [newCompany] = await db
        .insert(companies)
        .values({
          userId: authUser.user.id,
          companyName,
        })
        .returning();

      return res.status(201).json({
        message: "Company registered successfully",
        user: authUser.user,
        company: newCompany,
      });
    } catch (profileError) {
      console.error("Failed to create company profile:", profileError);
      return res.status(500).json({
        error: "User account created but company profile failed",
        details: profileError,
      });
    }
  } catch (error) {
    console.error("Company registration error:", error);
    return res.status(500).json({
      error: "Internal server error during registration",
      details: error,
    });
  }
});

// Get current user profile (student or company)
router.get("/profile", async (req: Request, res: Response) => {
  try {
    // Get session from Better Auth
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");

    if (!sessionToken) {
      return res.status(401).json({ error: "No session token provided" });
    }

    // Verify session with Better Auth
    const sessionResponse = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    );

    if (!sessionResponse.ok) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const session = await sessionResponse.json();
    const user = session.user;

    // Fetch profile based on role
    if (user.role === "student") {
      const [student] = await db
        .select()
        .from(students)
        .where((t) => t.userId === user.id)
        .limit(1);

      if (!student) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      return res.json({
        user,
        profile: student,
        profileType: "student",
      });
    } else if (user.role === "company") {
      const [company] = await db
        .select()
        .from(companies)
        .where((t) => t.userId === user.id)
        .limit(1);

      if (!company) {
        return res.status(404).json({ error: "Company profile not found" });
      }

      return res.json({
        user,
        profile: company,
        profileType: "company",
      });
    }

    return res.status(400).json({ error: "Invalid user role" });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
