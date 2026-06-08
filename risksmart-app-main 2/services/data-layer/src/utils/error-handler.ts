import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { isHttpError } from 'http-errors';

import { getLogger } from './logger';

const logger = getLogger();

/**
 * Standard error response structure for API Gateway.
 */
interface ErrorResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Formats an error into a standard API Gateway response.
 * Handles http-errors with their status codes, and returns 500 for unknown errors.
 */
export const formatErrorResponse = (error: unknown): ErrorResponse => {
  if (isHttpError(error)) {
    logger.warn('Client error', {
      statusCode: error.statusCode,
      errorName: error.name,
      errorMessage: error.message,
    });

    return {
      statusCode: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message }),
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Internal Server Error' }),
  };
};

/**
 * Error handler middleware for REST API Gateway v1 handlers.
 * Wraps handler to catch and format errors into proper API Gateway responses.
 */
export const restApiLambdaErrorHandler = (
  handler: (
    event: APIGatewayProxyEvent,
    context: Context
  ) => Promise<APIGatewayProxyResult>
) => {
  return async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
};

/**
 * Error handler middleware for HTTP API Gateway v2 handlers.
 * Wraps handler to catch and format errors into proper HTTP API v2 responses.
 */
export const httpApiLambdaErrorHandler = (
  handler: (
    event: APIGatewayProxyEventV2,
    context: Context
  ) => Promise<APIGatewayProxyStructuredResultV2>
) => {
  return async (
    event: APIGatewayProxyEventV2,
    context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
      return await handler(event, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
};
