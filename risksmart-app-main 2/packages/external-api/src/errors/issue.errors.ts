import { BaseApplicationError, BaseNotFoundError } from './base.errors';

export class IssueValidationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
    this.name = 'IssueValidationError';
  }
}

export class IssueMutationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, true);
    this.name = 'IssueMutationError';
  }
}

export class IssueNotFoundError extends BaseNotFoundError {
  constructor(message: string) {
    super(message);
    this.name = 'IssueNotFoundError';
  }
}
