import { BaseValidationError } from './base.errors';

export class CustomFieldValidationError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'CustomFieldValidationError';
  }
}
