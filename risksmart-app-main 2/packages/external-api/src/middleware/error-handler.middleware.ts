import type { Response } from 'express';
import createHttpError from 'http-errors';
import { ZodError } from 'zod';

import { BaseNotFoundError, BaseValidationError } from '../errors/base.errors';
import {
  getTRPCErrorHttpStatus,
  getTRPCErrorName,
  isTRPCClientError,
  parseTRPCErrorMessage,
} from '../trpc/trpc-error-mapping';
import type { AppRequest } from '../types/request';
import {
  createErrorMiddleware,
  createPublicMiddleware,
} from '../utils/createMiddleware';
import { serializeZodError } from '../utils/schemas';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export const errorHandler = createErrorMiddleware(
  (err: Error, req: AppRequest, res: Response) => {
    const timestamp = new Date().toISOString();

    // Default error response
    let statusCode = 500;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';
    let details: Array<{ field: string; message: string }> | undefined;

    const errorMap = {
      ValidationError: { code: 400, errorMsg: 'Validation Error' },
      UnauthorizedError: { code: 401, errorMsg: 'Unauthorized' },
      ForbiddenError: { code: 403, errorMsg: 'Forbidden' },
      NotFoundError: { code: 404, errorMsg: 'Not Found' },
    } as const;

    // Handle different error types
    if (createHttpError.isHttpError(err)) {
      statusCode = err.statusCode;
      error = err.name;
      message = err.message;
      // Handle HTTP errors created with zod
    } else if (err instanceof ZodError) {
      statusCode = 422;
      error = 'Validation Error';
      message = 'Request validation failed';
      details = serializeZodError(err);
      // Handle base validation error
    } else if (err instanceof BaseValidationError) {
      statusCode = 400;
      error = err.name;
      message = err.message;
      // Handle TRPC client errors
    } else if (isTRPCClientError(err)) {
      statusCode = getTRPCErrorHttpStatus(err);
      error = getTRPCErrorName(err);
      const parsed = parseTRPCErrorMessage(err);
      message = parsed.message;
      details = parsed.details;
      // handles base 404 not found error
    } else if (err instanceof BaseNotFoundError) {
      statusCode = 404;
      error = err.name;
      message = err.message;
      // Handle errors that match the error map shape
    } else if (errorMap[err.name as keyof typeof errorMap]) {
      const { errorMsg, code } = errorMap[err.name as keyof typeof errorMap];
      statusCode = code;
      error = errorMsg;
      message = err.message;
    }

    const errorResponse: ErrorResponse = {
      error,
      message,
      statusCode,
      timestamp,
      ...(details && { details }),
    };

    // Log error with appropriate level
    if (req.requestLogger) {
      if (statusCode >= 500) {
        req.requestLogger.error(
          {
            event: 'error_handler',
            error: {
              name: err.name,
              path: req.path,
              message: err.message,
              stack: err.stack,
            },
            statusCode,
          },
          message
        );
      } else if (statusCode >= 400) {
        req.requestLogger.warn(
          {
            event: 'client_error',
            path: req.path,
            error: err.message,
            statusCode,
          },
          message
        );
      }
    }

    res.status(statusCode).json(errorResponse);
  }
);

export const notFoundHandler = createPublicMiddleware((req, res) => {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  };

  if (req.requestLogger) {
    req.requestLogger.warn(
      {
        event: 'route_not_found',
        method: req.method,
        path: req.path,
      },
      'Route not found'
    );
  }

  res.status(404).json(errorResponse);
});
