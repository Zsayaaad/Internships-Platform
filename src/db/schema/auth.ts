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
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

/* ======================
   ACCOUNT
====================== */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

/* ======================
   VERIFICATION
====================== */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
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
