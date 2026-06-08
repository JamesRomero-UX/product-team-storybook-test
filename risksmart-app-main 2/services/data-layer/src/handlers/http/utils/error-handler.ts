import type { APIGatewayProxyResult } from 'aws-lambda';
import { isHttpError } from 'http-errors';

import { getLogger } from '../../../utils/logger';

const logger = getLogger();

/**
 * Handles errors and formats them into API Gateway responses
 *
 * @param error - Error to handle
 * @returns Formatted API Gateway response
 */
export const handleError = (error: unknown): APIGatewayProxyResult => {
  if (isHttpError(error)) {
    logger.warn('Client error', {
      error: error.message,
      statusCode: error.statusCode,
    });

    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: { message: error.message, code: error.name },
      }),
    };
  }

  // Log structured error details so they appear in CloudWatch / LocalStack logs
  if (error instanceof Error) {
    logger.error('Internal server error', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    });
  } else {
    logger.error('Internal server error (non-Error thrown)', {
      error: String(error),
    });
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    }),
  };
};
