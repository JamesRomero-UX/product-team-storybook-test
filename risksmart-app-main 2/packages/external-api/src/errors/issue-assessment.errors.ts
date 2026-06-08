import { BaseApplicationError } from './base.errors';

export class IssueAssessmentValidationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
    this.name = 'IssueAssessmentValidationError';
  }
}

export class IssueAssessmentMutationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, true);
    this.name = 'IssueAssessmentMutationError';
  }
}
