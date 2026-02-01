import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

import * as schema from "../db/schema/auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
    },
  },

  // Hook to create profile after user signs up instead of routes/auth.ts file
  // hooks: {
  //   after: [
  //     {
  //       matcher: (context) => context.path === "/sign-up/email",
  //       handler: async (context) => {
  //         const user = context.context.returned?.user;

  //         if (!user) return;

  //         // Get additional fields from request body
  //         const body = await context.context.body;

  //         try {
  //           if (user.role === "student") {
  //             // Create student profile
  //             await db.insert(students).values({
  //               userId: user.id,
  //               nationalId: body.nationalId,
  //               fullName: body.fullName || user.name,
  //               city: body.city,
  //               gpa: body.gpa,
  //               major: body.major,
  //               bioText: body.bioText || null,
  //             });
  //           } else if (user.role === "company") {
  //             // Create company profile
  //             await db.insert(companies).values({
  //               userId: user.id,
  //               companyName: body.companyName || user.name,
  //             });
  //           }
  //         } catch (error) {
  //           console.error("Failed to create profile:", error);
  //           // Profile creation failed, but user was created
  //           // You might want to handle this more gracefully
  //         }
  //       },
  //     },
  //   ],
  // },
});
