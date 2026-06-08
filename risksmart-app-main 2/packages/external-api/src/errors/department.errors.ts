import { BaseValidationError } from './base.errors';

export class DepartmentValidationError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'DepartmentValidationError';
  }
}
