import { ExternalServiceError, PartialFailureError } from '../errors';
import type {
  IngestionFailure,
  IngestionResult,
  IngestionSuccess,
} from '../types';

/**
 * Extracts AWS SDK-specific error properties that aren't on the base Error type.
 * AWS SDK errors extend Error with 'code'/'Code' and '$metadata.httpStatusCode'.
 */
const getAwsSdkErrorDetails = (
  error: unknown
): { code: string | undefined; statusCode: number | undefined } => {
  // AWS SDK errors extend Error; TypeScript can't narrow these extra properties from instanceof or `in` checks alone.
  const sdkError = error as Error & {
    code?: string;
    Code?: string;
    $metadata?: { httpStatusCode?: number };
  };

  const code =
    error instanceof Error && ('code' in error || 'Code' in error)
      ? (sdkError.code ?? sdkError.Code)
      : undefined;

  const statusCode =
    error instanceof Error && '$metadata' in error
      ? sdkError.$metadata?.httpStatusCode
      : undefined;

  return { code, statusCode };
};

/**
 * Converts a PromiseSettledResult to an IngestionResult
 */
export const toIngestionResult = (
  destination: string,
  result: PromiseSettledResult<void>
): IngestionResult => {
  return result.status === 'fulfilled'
    ? { destination, status: 'fulfilled' }
    : { destination, status: 'rejected', reason: result.reason };
};

/**
 * Handles the results from parallel ingestion to storage and Observability Platform.
 * Throws appropriate errors based on success/failure of destinations.
 */
export const handleIngestionResults = (
  results: IngestionResult[],
  feedbackId: string
): void => {
  const failures = results.filter(
    (r): r is IngestionFailure => r.status === 'rejected'
  );

  if (failures.length === results.length) {
    // Both failed - aggregate the errors with full details
    throw new ExternalServiceError(
      'Failed to ingest feedback to all destinations',
      'multiple',
      {
        feedbackId,
        errors: failures.map((failure) => {
          const error = failure.reason;

          const { code, statusCode } = getAwsSdkErrorDetails(error);

          return {
            service: failure.destination,
            message: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : undefined,
            stack: error instanceof Error ? error.stack : undefined,
            code,
            statusCode,
          };
        }),
      }
    );
  }

  if (failures.length > 0) {
    // Partial failure - at least one succeeded
    const succeeded = results
      .filter((r): r is IngestionSuccess => r.status === 'fulfilled')
      .map((r) => r.destination);

    const failed = failures.map((f) => f.destination);

    throw new PartialFailureError(
      'Feedback partially ingested - some destinations failed',
      succeeded,
      failed,
      {
        feedbackId,
        errors: failures.map((failure) => {
          const error = failure.reason;

          const { code, statusCode } = getAwsSdkErrorDetails(error);

          return {
            service: failure.destination,
            message: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : undefined,
            stack: error instanceof Error ? error.stack : undefined,
            code,
            statusCode,
          };
        }),
      }
    );
  }

  // All succeeded - no error thrown
};
