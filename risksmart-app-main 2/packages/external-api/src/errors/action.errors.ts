import { BaseApplicationError, BaseNotFoundError } from './base.errors';

export class ActionValidationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
    this.name = 'ActionValidationError';
  }
}

export class ActionMutationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, true);
    this.name = 'ActionMutationError';
  }
}

export class ActionNotFoundError extends BaseNotFoundError {
  constructor(message: string) {
    super(message);
    this.name = 'ActionNotFoundError';
  }
}
