import { db } from "../../db";
import { companies } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * Get company by user ID
 */
export async function getCompanyByUserId(userId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.userId, userId))
    .limit(1);

  return company;
}
