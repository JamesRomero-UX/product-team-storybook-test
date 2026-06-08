/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { TRPCClientError } from '@trpc/client';
import createHttpError from 'http-errors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ZodIssue } from 'zod';
import { ZodError } from 'zod';

import {
  createMockNext,
  createMockRequest,
  createMockResponse,
} from '../testing/test-utils';
import type { TRPCErrorCode } from '../trpc/trpc-error-mapping';
import type { Logger } from '../utils/logger';
import { errorHandler, notFoundHandler } from './error-handler.middleware';

function createTRPCError(
  message: string,
  code: TRPCErrorCode,
  httpStatus: number
): TRPCClientError<AppRouter> {
  const result = {
    error: {
      message,
      code: -32600 as const,
      data: { code, httpStatus },
    },
  };

  return new TRPCClientError<AppRouter>(message, { result });
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  describe('HTTP errors', () => {
    it('should handle 400 Bad Request error', async () => {
      const error = createHttpError(400, 'Invalid request format');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'BadRequestError',
        message: 'Invalid request format',
        statusCode: 400,
        timestamp: expect.any(String),
      });
    });

    it('should handle 401 Unauthorized error', async () => {
      const error = createHttpError(401, 'Authentication required');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'UnauthorizedError',
        message: 'Authentication required',
        statusCode: 401,
        timestamp: expect.any(String),
      });
    });

    it('should handle 403 Forbidden error', async () => {
      const error = createHttpError(403, 'Access denied');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'ForbiddenError',
        message: 'Access denied',
        statusCode: 403,
        timestamp: expect.any(String),
      });
    });

    it('should handle 404 Not Found error', async () => {
      const error = createHttpError(404, 'Resource not found');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'NotFoundError',
        message: 'Resource not found',
        statusCode: 404,
        timestamp: expect.any(String),
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      const error = createHttpError(500, 'Database connection failed');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'InternalServerError',
        message: 'Database connection failed',
        statusCode: 500,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Zod validation errors', () => {
    it('should handle ZodError with single field error', async () => {
      const zodIssue: ZodIssue = {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number',
      };
      const error = new ZodError([zodIssue]);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Request validation failed',
        statusCode: 422,
        timestamp: expect.any(String),
        details: [
          {
            field: 'name',
            message: 'Expected string, received number',
          },
        ],
      });
    });

    it('should handle ZodError with multiple field errors', async () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['email'],
          message: 'String must contain at least 1 character(s)',
        },
      ];
      const error = new ZodError(zodIssues);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Request validation failed',
        statusCode: 422,
        timestamp: expect.any(String),
        details: [
          {
            field: 'name',
            message: 'Expected string, received number',
          },
          {
            field: 'email',
            message: 'String must contain at least 1 character(s)',
          },
        ],
      });
    });

    it('should handle ZodError with nested field path', async () => {
      const zodIssue: ZodIssue = {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['user', 'profile', 'name'],
        message: 'Expected string, received number',
      };
      const error = new ZodError([zodIssue]);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Request validation failed',
        statusCode: 422,
        timestamp: expect.any(String),
        details: [
          {
            field: 'user.profile.name',
            message: 'Expected string, received number',
          },
        ],
      });
    });
  });

  describe('Custom error types', () => {
    it('should handle ValidationError', async () => {
      const error = new Error('Invalid input data');
      error.name = 'ValidationError';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Invalid input data',
        statusCode: 400,
        timestamp: expect.any(String),
      });
    });

    it('should handle UnauthorizedError', async () => {
      const error = new Error('Token expired');
      error.name = 'UnauthorizedError';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Token expired',
        statusCode: 401,
        timestamp: expect.any(String),
      });
    });

    it('should handle ForbiddenError', async () => {
      const error = new Error('Insufficient permissions');
      error.name = 'ForbiddenError';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        statusCode: 403,
        timestamp: expect.any(String),
      });
    });

    it('should handle NotFoundError', async () => {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Generic errors', () => {
    it('should handle generic Error with default 500 status', async () => {
      const error = new Error('Something went wrong');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500,
        timestamp: expect.any(String),
      });
    });

    it('should handle unknown error type', async () => {
      const error = new Error('Custom error message');
      error.name = 'CustomError';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500,
        timestamp: expect.any(String),
      });
    });
  });

  describe('TRPC client errors', () => {
    it.each<[TRPCErrorCode, number, string]>([
      ['BAD_REQUEST', 400, 'Bad Request'],
      ['UNAUTHORIZED', 401, 'Unauthorized'],
      ['FORBIDDEN', 403, 'Forbidden'],
      ['NOT_FOUND', 404, 'Not Found'],
      ['INTERNAL_SERVER_ERROR', 500, 'Internal Server Error'],
    ])(
      'should handle TRPCClientError with %s code',
      async (code, httpStatus, expectedError) => {
        const error = createTRPCError('trpc error', code, httpStatus);
        const req = createMockRequest();
        const res = createMockResponse();
        const next = createMockNext();

        await errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(httpStatus);
        expect(res.json).toHaveBeenCalledWith({
          error: expectedError,
          message: expectedError,
          statusCode: httpStatus,
          timestamp: expect.any(String),
        });
      }
    );

    it('should include validation details when message is a JSON ZodIssue array', async () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['field'],
          message: 'Expected string',
        },
      ];
      const error = createTRPCError(
        JSON.stringify(zodIssues),
        'BAD_REQUEST',
        400
      );
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Request validation failed',
        statusCode: 400,
        timestamp: expect.any(String),
        details: [{ field: 'field', message: 'Expected string' }],
      });
    });

    it('should not include details when message is not parseable JSON', async () => {
      const error = createTRPCError('plain error message', 'NOT_FOUND', 404);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      const jsonCall = vi.mocked(res.json).mock.calls?.[0]?.[0] as {
        details?: unknown;
      };
      expect(jsonCall).not.toHaveProperty('details');
    });

    it('should log 5xx TRPC errors with error level', async () => {
      const error = createTRPCError(
        'service down',
        'INTERNAL_SERVER_ERROR',
        500
      );
      const req = createMockRequest();
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          event: 'error_handler',
          error: {
            name: 'TRPCClientError',
            path: '/test',
            message: 'service down',
            stack: expect.any(String),
          },
          statusCode: 500,
        },
        'Internal Server Error'
      );
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should log 4xx TRPC errors with warn level', async () => {
      const error = createTRPCError('not authorized', 'UNAUTHORIZED', 401);
      const req = createMockRequest();
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          event: 'client_error',
          path: '/test',
          error: 'not authorized',
          statusCode: 401,
        },
        'Unauthorized'
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Logging behavior', () => {
    it('should log server errors (5xx) with error level', async () => {
      const error = createHttpError(500, 'Database connection failed');
      const req = createMockRequest();
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          event: 'error_handler',
          error: {
            name: 'InternalServerError',
            path: '/test',
            message: 'Database connection failed',
            stack: expect.any(String),
          },
          statusCode: 500,
        },
        'Database connection failed'
      );
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should log client errors (4xx) with warn level', async () => {
      const error = createHttpError(400, 'Invalid request');
      const req = createMockRequest();
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          event: 'client_error',
          path: '/test',
          error: 'Invalid request',
          statusCode: 400,
        },
        'Invalid request'
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should not log when requestLogger is not available', () => {
      const error = createHttpError(500, 'Server error');
      const req = createMockRequest({
        requestLogger: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => errorHandler(error, req, res, next)).not.toThrow();
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should log ZodError as client error', async () => {
      const zodIssue: ZodIssue = {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number',
      };
      const error = new ZodError([zodIssue]);
      const req = createMockRequest();
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        {
          event: 'client_error',
          path: '/test',
          error: expect.stringContaining('invalid_type'),
          statusCode: 422,
        },
        'Request validation failed'
      );
    });
  });

  describe('Response format', () => {
    it('should include timestamp in ISO format', async () => {
      const error = new Error('Test error');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      const jsonCall = vi.mocked(res.json).mock.calls?.[0]?.[0] as {
        timestamp: string;
      };
      expect(jsonCall.timestamp).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should not include details field for non-ZodError', async () => {
      const error = createHttpError(400, 'Bad request');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      const jsonCall = vi.mocked(res.json).mock.calls?.[0]?.[0];
      expect(jsonCall).not.toHaveProperty('details');
    });

    it('should include details field only for ZodError', async () => {
      const zodIssue: ZodIssue = {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number',
      };
      const error = new ZodError([zodIssue]);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await errorHandler(error, req, res, next);

      const jsonCall = vi.mocked(res.json).mock.calls?.[0]?.[0] as {
        details: ['detail-1'];
      };
      expect(jsonCall).toHaveProperty('details');
      expect(jsonCall.details).toHaveLength(1);
    });
  });
});

describe('notFoundHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('should handle GET request to non-existent route', async () => {
    const req = createMockRequest({
      method: 'GET',
      path: '/api/non-existent',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route GET /api/non-existent not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });

  it('should handle POST request to non-existent route', async () => {
    const req = createMockRequest({
      method: 'POST',
      path: '/api/users/create',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route POST /api/users/create not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });

  it('should handle PUT request to non-existent route', async () => {
    const req = createMockRequest({
      method: 'PUT',
      path: '/api/resources/123',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route PUT /api/resources/123 not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });

  it('should handle DELETE request to non-existent route', async () => {
    const req = createMockRequest({
      method: 'DELETE',
      path: '/api/items/456',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route DELETE /api/items/456 not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });

  it('should log route not found with warn level', async () => {
    const req = createMockRequest({
      method: 'GET',
      path: '/api/missing',
    });
    const mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };
    req.requestLogger = mockLogger as unknown as Logger;
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      {
        event: 'route_not_found',
        method: 'GET',
        path: '/api/missing',
      },
      'Route not found'
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('should not throw when requestLogger is not available', () => {
    const req = createMockRequest({
      method: 'GET',
      path: '/api/test',
      requestLogger: undefined,
    });

    const res = createMockResponse();
    const next = createMockNext();

    expect(() => notFoundHandler(req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should include timestamp in ISO format', async () => {
    const req = createMockRequest({
      method: 'GET',
      path: '/api/test',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    const jsonCall = vi.mocked(res.json).mock.calls?.[0]?.[0] as {
      timestamp: string;
    };
    expect(jsonCall.timestamp).toBe('2023-01-01T12:00:00.000Z');
  });

  it('should handle root path correctly', async () => {
    const req = createMockRequest({
      method: 'GET',
      path: '/',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route GET / not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });

  it('should handle empty path correctly', async () => {
    const req = createMockRequest({
      method: 'POST',
      path: '',
    });
    const res = createMockResponse();
    const next = createMockNext();

    await notFoundHandler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Route POST  not found',
      statusCode: 404,
      timestamp: expect.any(String),
    });
  });
});
