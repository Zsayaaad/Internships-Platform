// better error handling
export class DuplicateEmailError extends Error {
  constructor(message = "Email already exists") {
    super(message);
    this.name = "DuplicateEmailError";
  }
}

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}
