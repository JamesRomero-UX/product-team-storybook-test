/**
 * Custom error thrown when a Permit API response fails Zod validation.
 * This indicates an API contract violation or malformed response from Permit API.
 */
export class PermitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermitValidationError';
  }
}
