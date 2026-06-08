import {
  BaseApplicationError,
  BaseNotFoundError,
  BaseValidationError,
} from './base.errors';

export class InvalidRiskTierError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRiskTierError';
  }
}

export class RiskValidationError extends BaseValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'RiskValidationError';
  }
}

export class RiskMutationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, true);
    this.name = 'RiskMutationError';
  }
}

export class RiskNotFoundError extends BaseNotFoundError {
  constructor(message: string) {
    super(message);
    this.name = 'RiskNotFoundError';
  }
}
