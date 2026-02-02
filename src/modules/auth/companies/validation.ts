export interface RegisterCompanyDTO {
  email: string;
  password: string;
  companyName: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCompanyRegistration(data: RegisterCompanyDTO): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!data.email)
    errors.push({ field: "email", message: "Email is required" });
  if (!data.password)
    errors.push({ field: "password", message: "Password is required" });
  if (!data.companyName)
    errors.push({ field: "companyName", message: "Company name is required" });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
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
