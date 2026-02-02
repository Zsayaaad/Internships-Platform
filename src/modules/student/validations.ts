import { majorValues } from "../../db/schema/app";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateUpdateStudentProfile(data: any) {
  const errors: ValidationError[] = [];

  // Validate fullName
  if (data.fullName !== undefined) {
    if (typeof data.fullName !== "string") {
      errors.push({ field: "fullName", message: "Full name must be a string" });
    } else if (data.fullName.length < 2 || data.fullName.length > 200) {
      errors.push({
        field: "fullName",
        message: "Full name must be between 2 and 200 characters",
      });
    }
  }

  // Validate city
  if (data.city !== undefined) {
    if (typeof data.city !== "string") {
      errors.push({ field: "city", message: "City must be a string" });
    } else if (data.city.length < 2 || data.city.length > 100) {
      errors.push({
        field: "city",
        message: "City must be between 2 and 100 characters",
      });
    }
  }

  // Validate gpa
  if (data.gpa !== undefined) {
    const gpaNum = parseFloat(data.gpa);
    if (isNaN(gpaNum)) {
      errors.push({ field: "gpa", message: "GPA must be a valid number" });
    } else if (gpaNum < 0 || gpaNum > 4.0) {
      errors.push({
        field: "gpa",
        message: "GPA must be between 0.00 and 4.00",
      });
    }
  }

  // Validate major
  if (data.major !== undefined) {
    if (!majorValues.includes(data.major)) {
      errors.push({
        field: "major",
        message: `Major must be one of: ${majorValues.join(", ")}`,
      });
    }
  }

  // Validate bioText
  if (data.bioText !== undefined) {
    if (typeof data.bioText !== "string") {
      errors.push({ field: "bioText", message: "Bio text must be a string" });
    } else if (data.bioText.length < 10 || data.bioText.length > 1000) {
      errors.push({
        field: "bioText",
        message: "Bio text must be between 10 and 1000 characters",
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: null };
}
