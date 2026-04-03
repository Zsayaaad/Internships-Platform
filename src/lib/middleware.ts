import { db } from "../db";
import { eq } from "drizzle-orm";
import { students, companies } from "../db/schema";
import { user } from "../db/schema/auth";

/**
 * Middleware to verify Better Auth session and attach user to request
 */
export async function authenticateUser(req: any, res: any, next: any) {
  try {
    const sessionToken =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.["better-auth.session_token"];

    if (!sessionToken) {
      return res.status(401).json({ error: "Authentication required" });
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
    req.user = session.user;
    req.session = session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: roles,
        current: req.user.role,
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
