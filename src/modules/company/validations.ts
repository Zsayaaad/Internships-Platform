import { majorValues } from "../../db/schema/app";

export interface ValidationError {
  message: string;
}

export interface StudentSearchFilters {
  major?: string;
  city?: string;
  minGpa?: string;
  bioKeyword?: string;
}

export function validateStudentSearchFilters(filters: StudentSearchFilters): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validate major if provided
  if (filters.major && !majorValues.includes(filters.major as any)) {
    errors.push({
      message: `Major must be one of: ${majorValues.join(", ")}`,
    });
  }

  // Validate minGpa if provided
  if (filters.minGpa !== undefined) {
    const gpaNum = parseFloat(filters.minGpa);
    if (isNaN(gpaNum)) {
      errors.push({
        message: "Minimum GPA must be a valid number",
      });
    } else if (gpaNum < 0 || gpaNum > 4.0) {
      errors.push({
        message: "Minimum GPA must be between 0.00 and 4.00",
      });
    }
  }

  // Validate city if provided
  if (filters.city && typeof filters.city !== "string") {
    errors.push({
      message: "City must be a string",
    });
  }

  // Validate bioKeyword if provided
  if (filters.bioKeyword && typeof filters.bioKeyword !== "string") {
    errors.push({
      message: "Bio keyword must be a string",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
