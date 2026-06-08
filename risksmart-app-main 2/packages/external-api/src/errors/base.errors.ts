/**
 * Base error class that can be extended to indicate whether the error
 * should be handled by circuit breaker policies (retries, breaker trips).
 */
export abstract class BaseApplicationError extends Error {
  /**
   * Whether this error should be handled by circuit breaker policies.
   * - true: Error represents a transient failure (network issues, service unavailable)
   * - false: Error represents business logic/permanent failure (validation, limits, auth)
   */
  public readonly isTransientFailure: boolean;

  constructor(message: string, isTransientFailure = false) {
    super(message);
    this.isTransientFailure = isTransientFailure;
  }
}

export abstract class BaseNotFoundError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
  }
}

export abstract class BaseValidationError extends BaseApplicationError {
  constructor(message: string) {
    super(message, false);
  }
}
