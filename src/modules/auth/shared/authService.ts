import { auth } from "../../../lib/auth";
import { RegistrationError } from "./errorHandler";

import { Request, Response, NextFunction } from "express";
import { db } from "../../../db";
import { eq, and, gt } from "drizzle-orm";
import { companies, students, user } from "../../../db/schema";
import { session } from "../../../db/schema/auth";

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

/**
 * Middleware to verify Better Auth session and attach user to request
 * Queries the session directly from the database
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.cookie) {
      // Parse cookie header for better-auth.session_token
      const cookies = req.headers.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "better-auth.session_token") {
          token = value;
          break;
        }
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required - no token provided" });
    }

    // Query session directly from database
    const [userSession] = await db
      .select()
      .from(session)
      .where(and(eq(session.token, token), gt(session.expiresAt, new Date()))) // Is expiration date still in the FUTURE?
      .limit(1);

    if (!userSession) {
      return res.status(401).json({
        error: "Authentication required - invalid or expired session",
      });
    }

    // Get user details
    const [authUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userSession.userId))
      .limit(1);

    if (!authUser) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = authUser;
    req.session = userSession;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      error: "Authentication failed",
    });
  }
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      // Why std gets here ???

      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

/**
 * Get student profile by user ID
 */
export async function getStudentProfile(userId: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return student;
}

/**
 * Get company profile by user ID
 */
export async function getCompanyProfile(userId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.userId, userId))
    .limit(1);

  return company;
}

/**
 * Get full user profile (auth user + student/company data)
 */
export async function getFullProfile(userId: string) {
  const [authUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!authUser) {
    return null;
  }

  if (authUser.role === "student") {
    const student = await getStudentProfile(userId);
    return {
      user: authUser,
      profile: student,
      profileType: "student" as const,
    };
  } else if (authUser.role === "company") {
    const company = await getCompanyProfile(userId);
    return {
      user: authUser,
      profile: company,
      profileType: "company" as const,
    };
  }

  return null;
}
// ===========================================================

export async function createAuthUser(
  email: string,
  password: string,
  name: string,
  role: "student" | "company",
) {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role,
    },
  });

  if (!result?.user) {
    throw new RegistrationError("Failed to create user account");
  }

  return result.user;
}
