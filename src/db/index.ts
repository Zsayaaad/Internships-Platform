// import "dotenv/config";
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";

// if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

// const sql = neon(process.env.DATABASE_URL);
// export const db = drizzle(sql);

// import "dotenv/config";
// import { drizzle } from "drizzle-orm/neon-serverless";
// import { Pool } from "@neondatabase/serverless";

// if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool);

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
