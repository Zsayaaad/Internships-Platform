export interface ValidationError {
  message: string;
}

export interface ApplicationValidationData {
  internshipId: number;
  wishOrder: number;
}

export function validateApplicationData(data: ApplicationValidationData): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Validate internshipId
  if (
    !data.internshipId ||
    !Number.isInteger(data.internshipId) ||
    data.internshipId <= 0
  ) {
    errors.push({
      message: "Internship ID must be a positive integer",
    });
  }

  // Validate wishOrder
  if (!data.wishOrder || !Number.isInteger(data.wishOrder)) {
    errors.push({
      message: "Wish order is required and must be a number",
    });
  } else if (data.wishOrder < 1 || data.wishOrder > 3) {
    errors.push({
      message: "Wish order must be between 1 and 3",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
