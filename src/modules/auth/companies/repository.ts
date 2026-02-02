import { db } from "../../../db";
import { companies } from "../../../db/schema";

interface CompanyProfileData {
  companyName: string;
}
export async function createCompanyProfile(
  userId: string,
  data: CompanyProfileData,
) {
  await db.insert(companies).values({
    userId,
    companyName: data.companyName,
  });
}
