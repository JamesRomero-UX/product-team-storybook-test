import { describe, expect, it } from 'vitest';

import { BaseApplicationError, BaseNotFoundError } from './base.errors';
import {
  IssueMutationError,
  IssueNotFoundError,
  IssueValidationError,
} from './issue.errors';

describe('IssueValidationError', () => {
  it('should be an instance of BaseApplicationError', () => {
    const error = new IssueValidationError('test');
    expect(error).toBeInstanceOf(BaseApplicationError);
  });

  it('should have isTransientFailure set to false', () => {
    const error = new IssueValidationError('test');
    expect(error.isTransientFailure).toBe(false);
  });

  it('should have the correct name', () => {
    const error = new IssueValidationError('test');
    expect(error.name).toBe('IssueValidationError');
  });
});

describe('IssueMutationError', () => {
  it('should be an instance of BaseApplicationError', () => {
    const error = new IssueMutationError('test');
    expect(error).toBeInstanceOf(BaseApplicationError);
  });

  it('should have isTransientFailure set to true', () => {
    const error = new IssueMutationError('test');
    expect(error.isTransientFailure).toBe(true);
  });

  it('should have the correct name', () => {
    const error = new IssueMutationError('test');
    expect(error.name).toBe('IssueMutationError');
  });
});

describe('IssueNotFoundError', () => {
  it('should be an instance of BaseNotFoundError', () => {
    const error = new IssueNotFoundError('test');
    expect(error).toBeInstanceOf(BaseNotFoundError);
  });

  it('should have isTransientFailure set to false', () => {
    const error = new IssueNotFoundError('test');
    expect(error.isTransientFailure).toBe(false);
  });

  it('should have the correct name', () => {
    const error = new IssueNotFoundError('test');
    expect(error.name).toBe('IssueNotFoundError');
  });
});
