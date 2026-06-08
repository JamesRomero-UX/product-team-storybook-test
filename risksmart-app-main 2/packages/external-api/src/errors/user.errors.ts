import { BaseNotFoundError, BaseValidationError } from './base.errors';

export class UserNotFoundError extends BaseNotFoundError {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class UserValidationError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
  }
}
