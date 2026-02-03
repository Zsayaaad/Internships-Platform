import { Internship } from "../../../db/schema";

export interface ValidationError {
  message: string;
}

// export interface InternshipPostData {
//   title: string;
//   description?: string;
//   requiredMajor: string;
//   city: string;
//   minGpa: string | number;
//   capacity: number;
// }

export function validatePostingInternship(data: Internship): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validation
  if (
    !data.title ||
    !data.requiredMajor ||
    !data.city ||
    !data.minGpa ||
    !data.capacity
  ) {
    errors.push({
      message: "title, requiredMajor, city, minGpa, and capacity are required",
    });
  }

  // Validate major enum
  const validMajors = ["CS", "IT", "IS", "AI", "DS"];
  if (!validMajors.includes(data.requiredMajor)) {
    errors.push({
      message: `requiredMajor must be one of: ${validMajors.join(", ")}`,
    });
  }

  // Validate GPA
  const gpaNum = parseFloat(String(data.minGpa));
  if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
    errors.push({
      message: "minGpa must be a number between 0 and 4",
    });
  }

  // Validate capacity
  if (!Number.isInteger(data.capacity) || data.capacity < 1) {
    errors.push({
      message: "capacity must be a positive integer",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// export interface InternshipUpdateData {
//   title?: string;
//   description?: string;
//   requiredMajor?: string;
//   city?: string;
//   minGpa?: string | number;
//   capacity?: number;
//   status?: string;
// }

export function validateInternshipUpdate(data: Internship): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validate status if provided
  if (data.status) {
    const validStatuses = ["active", "inactive", "filled"];
    if (!validStatuses.includes(data.status)) {
      errors.push({
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }
  }

  // Validate major if provided
  if (data.requiredMajor) {
    const validMajors = ["CS", "IT", "IS", "AI", "DS"];
    if (!validMajors.includes(data.requiredMajor)) {
      errors.push({
        message: `requiredMajor must be one of: ${validMajors.join(", ")}`,
      });
    }
  }

  // Validate GPA if provided
  if (data.minGpa !== undefined) {
    const gpaNum = parseFloat(String(data.minGpa));
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      errors.push({
        message: "minGpa must be a number between 0 and 4",
      });
    }
  }

  // Validate capacity if provided
  if (data.capacity !== undefined) {
    if (!Number.isInteger(data.capacity) || data.capacity < 1) {
      errors.push({
        message: "capacity must be a positive integer",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
