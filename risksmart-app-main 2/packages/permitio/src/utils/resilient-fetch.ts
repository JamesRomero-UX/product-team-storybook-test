import { logger } from './logger';

// Resilience policy configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const;

/**
 * Implements exponential backoff retry logic for API calls
 */
export const withRetryWrapper = async <T>(
  operation: () => Promise<T>,
  context: string,
  retries = RETRY_CONFIG.maxRetries
): Promise<T> => {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on final attempt
      if (attempt === retries) {
        break;
      }

      // Check if error is retryable (network errors, 5xx, 429)
      const isRetryable = isRetryableError(error);
      if (!isRetryable) {
        logger.warn(
          { error: lastError.message, context, attempt },
          'Non-retryable error encountered, not retrying'
        );
        break;
      }

      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs *
          Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
        RETRY_CONFIG.maxDelayMs
      );

      logger.warn(
        {
          error: lastError.message,
          context,
          attempt: attempt + 1,
          maxRetries: retries,
          delayMs: delay,
        },
        'API call failed, retrying with exponential backoff'
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  logger.error(
    { error: lastError.message, context, totalAttempts: retries + 1 },
    'All retry attempts exhausted'
  );
  throw lastError;
};

/**
 * Determines if an error is retryable based on error type and status code
 */
const isRetryableError = (error: unknown): boolean => {
  // Network errors (no response)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check for Response objects with retryable status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    // Retry on 5xx server errors and 429 rate limiting

    return status >= 500 || status === 429;
  }

  // Handle AxiosError from permitio SDK
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status
  ) {
    const status = (error as { response: { status: number } }).response.status;

    return status >= 500 || status === 429;
  }

  // Check for Error objects that might contain fetch failures
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('econnreset') ||
      errorMessage.includes('enotfound')
    );
  }

  return false;
};

/**
 * Enhanced fetch wrapper with retry logic, error handling, and timing metrics
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param context - Context for logging (operation name)
 * @returns Promise that resolves to the Response object
 * @throws Error with status and body properties for HTTP errors
 */
export const resilientFetch = async (
  url: string,
  options: RequestInit,
  context: string
): Promise<Response> => {
  const startTime = performance.now();
  let attemptCount = 0;

  return withRetryWrapper(async () => {
    attemptCount++;
    const attemptStartTime = performance.now();

    const response = await fetch(url, options);

    const attemptDurationMs = performance.now() - attemptStartTime;

    // Throw for non-2xx responses to trigger retry logic if applicable
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as Error & { status: number; body: unknown };
      error.status = response.status;
      error.body = errorBody;

      const totalDurationMs = performance.now() - startTime;
      logger.error(
        {
          url: url,
          method: options.method,
          status: response.status,
          body: errorBody,
          durationMs: Math.round(attemptDurationMs),
          totalDurationMs: Math.round(totalDurationMs),
          attempt: attemptCount,
          context,
        },
        'HTTP error response from Permit API'
      );

      throw error;
    }

    // Log timing metrics only for successful responses
    logger.info(
      {
        url: url,
        method: options.method,
        status: response.status,
        durationMs: Math.round(attemptDurationMs),
        attempt: attemptCount,
        context,
      },
      'Permit API request completed'
    );

    return response;
  }, context);
};

// Export configuration for testing
export { isRetryableError, RETRY_CONFIG };
