import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

/* ======================
   ENUMS
====================== */
export const roleEnum = pgEnum("role", ["student", "company"]);

/* ======================
   USER
====================== */
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: roleEnum("role").notNull().default("student"),
    ...timestamps,
  },
  (t) => ({
    emailUnique: uniqueIndex("uq_user_email").on(t.email),
  }),
);

/* ======================
   SESSION
====================== */
export const session = pgTable("session", {
  id: text("id").primaryKey(), // Unique identifier for each session
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"), // means from where u do ur request(Browser | HTTPi | postman..etc )
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

/* ======================
   ACCOUNT
   The account table is essentially a mapping: "This external provider account belongs to this user in our system."
====================== */
export const account = pgTable("account", {
  id: text("id").primaryKey(), // Unique identifier for each account
  accountId: text("account_id").notNull(), // accountId - External provider's ID
  /**
   * - based on th method of login(The ID that Google/GitHub/Facebook or (email&password) uses for that user )
   * - Login with Google → one account record (accountId = providerId(Google's ID), userId = your user ID)
   * - Login with GitHub → another account record (accountId = providerId(GitHub's ID), same userId)
   * - Email/password → another account record (accountId could be email, same userId)
   */
  providerId: text("provider_id").notNull(), // Google → providerId = "104958123456789012345" | if user signs in with Google
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"), // The access token of the account. Returned by the provider
  refreshToken: text("refresh_token"), // The refresh token of the account. Returned by the provider
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"), // scope of permissions(Allowing), whit Email&Pass auth.. put scope as null
  password: text("password"),
  ...timestamps,
});

/* ======================
   VERIFICATION
====================== */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(), //"email", "resetPassword", or "oauth-state"
  value: text("value").notNull(), // The one-time link token sent via email, or a user's ID
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

/* ======================
   TYPES
====================== */
export type User = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;

export type Session = InferSelectModel<typeof session>;
export type InsertSession = InferInsertModel<typeof session>;

export type Account = InferSelectModel<typeof account>;
export type InsertAccount = InferInsertModel<typeof account>;

export type Verification = InferSelectModel<typeof verification>;
export type InsertVerification = InferInsertModel<typeof verification>;
