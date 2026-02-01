export interface RegisterStudentDTO {
  email: string;
  password: string;
  nationalId: string;
  fullName: string;
  city: string;
  gpa: number;
  major: "CS" | "IT" | "IS" | "AI" | "DS";
  bioText: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateStudentRegistration(data: RegisterStudentDTO): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!data.email)
    errors.push({ field: "email", message: "Email is required" });
  if (!data.password)
    errors.push({ field: "password", message: "Password is required" });
  if (!data.fullName)
    errors.push({ field: "fullName", message: "Full name is required" });
  if (!data.nationalId)
    errors.push({ field: "nationalId", message: "National ID is required" });
  if (!data.city) errors.push({ field: "city", message: "City is required" });
  if (data.gpa === undefined || data.gpa === null) {
    errors.push({ field: "gpa", message: "GPA is required" });
  }
  if (!data.major)
    errors.push({ field: "major", message: "Major is required" });
  if (!data.bioText)
    errors.push({ field: "bioText", message: "Bio text is required" });

  // Validate GPA range
  if (data.gpa !== undefined && (data.gpa < 0 || data.gpa > 4)) {
    errors.push({ field: "gpa", message: "GPA must be between 0 and 4" });
  }

  // Validate major
  const validMajors = ["CS", "IT", "IS", "AI", "DS"];
  if (data.major && !validMajors.includes(data.major)) {
    errors.push({
      field: "major",
      message: `Major must be one of: ${validMajors.join(", ")}`,
    });
  }

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password length
  if (data.password && data.password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
