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
 * Error handler middleware for REST API Gateway v1 handlers.
 * Wraps handler to catch and format errors into proper API Gateway responses.
 */
export const restApiLambdaErrorHandler = (
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event);
    } catch (error) {
      if (isHttpError(error)) {
        logger.warn('Client error', {
          statusCode: error.statusCode,
          errorName: error.name,
          errorMessage: error.message,
        });

        return {
          statusCode: error.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
          }),
        };
      }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Internal Server Error',
        }),
      };
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
      if (isHttpError(error)) {
        logger.warn('Client error', {
          statusCode: error.statusCode,
          errorName: error.name,
          errorMessage: error.message,
        });

        return {
          statusCode: error.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
          }),
        };
      }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Internal Server Error',
        }),
      };
    }
  };
};
