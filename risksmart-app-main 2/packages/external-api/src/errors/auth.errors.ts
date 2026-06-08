import { BaseApplicationError } from './base.errors';

export class InvalidAuthTokenRequestError extends BaseApplicationError {
  constructor(message = 'Invalid credentials') {
    super(message, false);
    this.name = 'InvalidAuthCredentials';
  }
}
