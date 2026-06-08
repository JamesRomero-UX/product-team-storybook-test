import { describe, expect, it } from 'vitest';

import { BaseApplicationError } from './base.errors';
import {
  IssueAssessmentMutationError,
  IssueAssessmentValidationError,
} from './issue-assessment.errors';

describe('IssueAssessmentValidationError', () => {
  it('should be an instance of BaseApplicationError', () => {
    const error = new IssueAssessmentValidationError('test');
    expect(error).toBeInstanceOf(BaseApplicationError);
  });

  it('should have isTransientFailure set to false', () => {
    const error = new IssueAssessmentValidationError('test');
    expect(error.isTransientFailure).toBe(false);
  });

  it('should have the correct name', () => {
    const error = new IssueAssessmentValidationError('test');
    expect(error.name).toBe('IssueAssessmentValidationError');
  });
});

describe('IssueAssessmentMutationError', () => {
  it('should be an instance of BaseApplicationError', () => {
    const error = new IssueAssessmentMutationError('test');
    expect(error).toBeInstanceOf(BaseApplicationError);
  });

  it('should have isTransientFailure set to true', () => {
    const error = new IssueAssessmentMutationError('test');
    expect(error.isTransientFailure).toBe(true);
  });

  it('should have the correct name', () => {
    const error = new IssueAssessmentMutationError('test');
    expect(error.name).toBe('IssueAssessmentMutationError');
  });
});
