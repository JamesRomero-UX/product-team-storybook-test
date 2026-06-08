import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { TRPCClientError } from '@trpc/client';
import { describe, expect, it } from 'vitest';
import type { ZodIssue } from 'zod';

import {
  getTRPCErrorHttpStatus,
  getTRPCErrorName,
  isTRPCClientError,
  isTRPCTransientError,
  parseTRPCErrorMessage,
  type TRPCErrorCode,
} from './trpc-error-mapping';

// Common mock error shapes
interface MockTRPCErrorData {
  code?: TRPCErrorCode;
  httpStatus?: number;
}

interface MockTRPCClientErrorShape extends Error {
  data?: MockTRPCErrorData;
}

function createMockErrorShape(
  message: string,
  data?: MockTRPCErrorData
): MockTRPCClientErrorShape {
  const error = new Error(message) as MockTRPCClientErrorShape;
  error.data = data;

  return error;
}

const mockZodIssues: ZodIssue[] = [
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'number',
    path: ['name'],
    message: 'Expected string, received number',
  },
];

const mockMultipleZodIssues: ZodIssue[] = [
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
    path: ['user', 'email'],
    message: 'String must contain at least 1 character(s)',
  },
];

describe('trpc-error-mapping', () => {
  describe('isTRPCClientError', () => {
    it('should return true for a TRPCClientError instance', () => {
      const error = new TRPCClientError<AppRouter>('test error');

      expect(isTRPCClientError(error)).toBe(true);
    });

    it.each([
      ['plain Error', new Error('plain error')],
      ['string', 'error string'],
      ['null', null],
      ['undefined', undefined],
      [
        'object with error-like properties',
        { message: 'fake', data: { code: 'BAD_REQUEST' } },
      ],
    ])('should return false for %s', (_label, value) => {
      expect(isTRPCClientError(value)).toBe(false);
    });
  });

  describe('getTRPCErrorHttpStatus', () => {
    it.each([400, 401, 403, 404, 422, 429, 500, 502, 503])(
      'should return %i when httpStatus is %i',
      (status) => {
        const error = createMockErrorShape('error', { httpStatus: status });

        expect(getTRPCErrorHttpStatus(error)).toBe(status);
      }
    );

    it('should return 500 when httpStatus is not set', () => {
      const error = createMockErrorShape('error', { code: 'BAD_REQUEST' });

      expect(getTRPCErrorHttpStatus(error)).toBe(500);
    });

    it('should return 500 when data is undefined', () => {
      const error = createMockErrorShape('error');

      expect(getTRPCErrorHttpStatus(error)).toBe(500);
    });
  });

  describe('getTRPCErrorName', () => {
    it.each<[TRPCErrorCode, string]>([
      ['BAD_REQUEST', 'Bad Request'],
      ['UNAUTHORIZED', 'Unauthorized'],
      ['FORBIDDEN', 'Forbidden'],
      ['NOT_FOUND', 'Not Found'],
      ['CONFLICT', 'Conflict'],
      ['UNPROCESSABLE_CONTENT', 'Unprocessable Entity'],
      ['TOO_MANY_REQUESTS', 'Too Many Requests'],
      ['INTERNAL_SERVER_ERROR', 'Internal Server Error'],
    ])('should return "%s" for %s code', (code, expectedName) => {
      const error = createMockErrorShape('error', { code });

      expect(getTRPCErrorName(error)).toBe(expectedName);
    });

    it.each<TRPCErrorCode>([
      'SERVICE_UNAVAILABLE',
      'GATEWAY_TIMEOUT',
      'BAD_GATEWAY',
    ])('should return "Internal Server Error" for unmapped code %s', (code) => {
      const error = createMockErrorShape('error', { code });

      expect(getTRPCErrorName(error)).toBe('Internal Server Error');
    });

    it('should return "Internal Server Error" when code is undefined', () => {
      const error = createMockErrorShape('error', { httpStatus: 500 });

      expect(getTRPCErrorName(error)).toBe('Internal Server Error');
    });

    it('should return "Internal Server Error" when data is undefined', () => {
      const error = createMockErrorShape('error');

      expect(getTRPCErrorName(error)).toBe('Internal Server Error');
    });
  });

  describe('parseTRPCErrorMessage', () => {
    it('should parse a JSON-stringified ZodIssue array into validation details', () => {
      const error = createMockErrorShape(JSON.stringify(mockZodIssues));

      const result = parseTRPCErrorMessage(error);

      expect(result).toEqual({
        message: 'Request validation failed',
        details: [
          { field: 'name', message: 'Expected string, received number' },
        ],
      });
    });

    it('should parse multiple ZodIssues with nested paths', () => {
      const error = createMockErrorShape(JSON.stringify(mockMultipleZodIssues));

      const result = parseTRPCErrorMessage(error);

      expect(result).toEqual({
        message: 'Request validation failed',
        details: [
          { field: 'name', message: 'Expected string, received number' },
          {
            field: 'user.email',
            message: 'String must contain at least 1 character(s)',
          },
        ],
      });
    });

    it('should fall back to error name for non-JSON message', () => {
      const error = createMockErrorShape('Something went wrong', {
        code: 'BAD_REQUEST',
      });

      const result = parseTRPCErrorMessage(error);

      expect(result).toEqual({ message: 'Bad Request' });
    });

    it('should fall back to "Internal Server Error" for non-JSON message without code', () => {
      const error = createMockErrorShape('Something went wrong');

      const result = parseTRPCErrorMessage(error);

      expect(result).toEqual({ message: 'Internal Server Error' });
    });

    it.each<[string, string, TRPCErrorCode, string]>([
      ['empty JSON array', JSON.stringify([]), 'NOT_FOUND', 'Not Found'],
      [
        'non-array JSON object',
        JSON.stringify({ key: 'value' }),
        'FORBIDDEN',
        'Forbidden',
      ],
      [
        'JSON string value',
        JSON.stringify('just a string'),
        'UNAUTHORIZED',
        'Unauthorized',
      ],
    ])(
      'should fall back to error name for %s',
      (_label, message, code, expectedName) => {
        const error = createMockErrorShape(message, { code });

        const result = parseTRPCErrorMessage(error);

        expect(result).toEqual({ message: expectedName });
      }
    );

    it('should not include details when message is not parseable', () => {
      const error = createMockErrorShape('not json at all');

      const result = parseTRPCErrorMessage(error);

      expect(result.details).toBeUndefined();
    });
  });

  describe('isTRPCTransientError', () => {
    it.each([500, 502, 503, 504])(
      'should return true for %i status (server error)',
      (status) => {
        const error = createMockErrorShape('error', { httpStatus: status });

        expect(isTRPCTransientError(error)).toBe(true);
      }
    );

    it.each([400, 401, 403, 404, 422, 429, 499])(
      'should return false for %i status (client error)',
      (status) => {
        const error = createMockErrorShape('error', { httpStatus: status });

        expect(isTRPCTransientError(error)).toBe(false);
      }
    );

    it('should return true when httpStatus is missing (defaults to 500)', () => {
      const error = createMockErrorShape('error');

      expect(isTRPCTransientError(error)).toBe(true);
    });
  });
});
