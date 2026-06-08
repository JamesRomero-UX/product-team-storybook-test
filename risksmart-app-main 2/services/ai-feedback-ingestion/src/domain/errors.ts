/**
 * Base error class for all feedback ingestion errors
 */
export abstract class FeedbackIngestionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation errors (e.g., missing required fields)
 */
export class ValidationError extends FeedbackIngestionError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);
  }
}

/**
 * External service errors (Firehose, LangSmith)
 */
export class ExternalServiceError extends FeedbackIngestionError {
  constructor(
    message: string,
    public readonly service: 'storage' | 'observability' | 'multiple',
    context?: Record<string, unknown>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, {
      ...context,
      service,
    });
  }
}

/**
 * Configuration errors (missing env vars, invalid config)
 */
export class ConfigurationError extends FeedbackIngestionError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, context);
  }
}

/**
 * Partial failure when one destination succeeds but another fails
 */
export class PartialFailureError extends FeedbackIngestionError {
  constructor(
    message: string,
    public readonly succeeded: string[],
    public readonly failed: string[],
    context?: Record<string, unknown>
  ) {
    super(message, 'PARTIAL_FAILURE', 207, {
      ...context,
      succeeded,
      failed,
    });
  }
}
