import { students } from "../../../db/schema";
import { db } from "../../../db";

interface StudentProfileData {
  nationalId: string;
  fullName: string;
  city: string;
  gpa: string;
  major: "CS" | "IT" | "IS" | "AI" | "DS";
  bioText: string;
}
export async function createStudentProfile(
  userId: string,
  data: StudentProfileData,
) {
  await db.insert(students).values({
    userId,
    nationalId: data.nationalId,
    fullName: data.fullName,
    city: data.city,
    gpa: data.gpa,
    major: data.major,
    bioText: data.bioText,
  });
}
