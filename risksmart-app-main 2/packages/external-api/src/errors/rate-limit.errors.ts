import { BaseApplicationError } from './base.errors';

export class InvalidRateLimiterOptionError extends BaseApplicationError {
  constructor(message = 'Invalid or missing rate limiter option selected') {
    super(message, false);
    this.name = 'InvalidRateLimiterOption';
  }
}

export class UnexpectedRateLimiterError extends BaseApplicationError {
  constructor(message = 'Rate limiter backend failure') {
    super(message, false);
    this.name = 'UnexpectedRateLimiter';
  }
}
