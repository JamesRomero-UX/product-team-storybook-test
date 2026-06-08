import {
  BaseApplicationError,
  BaseNotFoundError,
  BaseValidationError,
} from './base.errors';

export class IndicatorValidationError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'IndicatorValidationError';
  }
}

export class IndicatorMutationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, true);
    this.name = 'IndicatorMutationError';
  }
}

export class IndicatorNotFoundError extends BaseNotFoundError {
  constructor(message: string) {
    super(message);
    this.name = 'IndicatorNotFoundError';
  }
}

export class InvalidIndicatorResultError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
    this.name = 'InvalidIndicatorResultError';
  }
}
