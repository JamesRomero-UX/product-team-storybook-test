import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';

import { isSuccessStatus, mapHttpStatusToTRPCError } from '../error-mapping';

describe('mapHttpStatusToTRPCError', () => {
  describe('HTTP status → TRPC error code mapping', () => {
    it.each([
      [400, 'BAD_REQUEST'],
      [401, 'UNAUTHORIZED'],
      [403, 'FORBIDDEN'],
      [404, 'NOT_FOUND'],
      [409, 'CONFLICT'],
      [422, 'UNPROCESSABLE_CONTENT'],
      [429, 'TOO_MANY_REQUESTS'],
      [500, 'INTERNAL_SERVER_ERROR'],
      [502, 'INTERNAL_SERVER_ERROR'],
      [503, 'INTERNAL_SERVER_ERROR'],
      [504, 'TIMEOUT'],
    ] as const)('status %i → TRPCError code %s', (status, expectedCode) => {
      const error = mapHttpStatusToTRPCError(status);
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe(expectedCode);
    });

    it('unmapped status code → INTERNAL_SERVER_ERROR', () => {
      const error = mapHttpStatusToTRPCError(418);
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('message priority: override > response body > default', () => {
    it('uses override message when provided for known status', () => {
      const error = mapHttpStatusToTRPCError(404, undefined, {
        404: 'Parent action not found',
      });
      expect(error.message).toBe('Parent action not found');
    });

    it('uses response body message when no override is set', () => {
      const error = mapHttpStatusToTRPCError(404, {
        message: 'Custom not found',
      });
      expect(error.message).toBe('Custom not found');
    });

    it('uses default message when no override and no response message', () => {
      const error = mapHttpStatusToTRPCError(404);
      expect(error.message).toBe('Resource not found');
    });

    it('override takes priority over response body message', () => {
      const error = mapHttpStatusToTRPCError(
        404,
        { message: 'Body message' },
        { 404: 'Override message' }
      );
      expect(error.message).toBe('Override message');
    });

    it('uses overrides.default as fallback for unmapped status codes', () => {
      const error = mapHttpStatusToTRPCError(418, undefined, {
        default: 'Custom fallback',
      });
      expect(error.message).toBe('Custom fallback');
    });

    it('uses overrides.default as fallback when mapped status has no specific override', () => {
      const error = mapHttpStatusToTRPCError(400, undefined, {
        default: 'Custom fallback',
      });
      expect(error.message).toBe('Custom fallback');
    });

    it('uses "An unexpected error occurred" for unmapped status with no overrides or response', () => {
      const error = mapHttpStatusToTRPCError(418);
      expect(error.message).toBe('An unexpected error occurred');
    });
  });

  describe('response body shapes', () => {
    it('extracts message from { message: string }', () => {
      const error = mapHttpStatusToTRPCError(500, {
        message: 'Server blew up',
      });
      expect(error.message).toBe('Server blew up');
    });

    it('extracts message from { error: string }', () => {
      const error = mapHttpStatusToTRPCError(500, {
        error: 'Something went wrong',
      });
      expect(error.message).toBe('Something went wrong');
    });

    it('extracts message from plain string response', () => {
      const error = mapHttpStatusToTRPCError(500, 'plain string error');
      expect(error.message).toBe('plain string error');
    });

    it('falls back to default when response is null', () => {
      const error = mapHttpStatusToTRPCError(500, null);
      expect(error.message).toBe('Internal server error');
    });

    it('falls back to default when response has unknown shape', () => {
      const error = mapHttpStatusToTRPCError(500, { unknownKey: 'value' });
      expect(error.message).toBe('Internal server error');
    });

    it('falls back to default when response is a number', () => {
      const error = mapHttpStatusToTRPCError(500, 42);
      expect(error.message).toBe('Internal server error');
    });
  });
});

describe('isSuccessStatus', () => {
  it.each([200, 201, 204, 299])('status %i → true', (status) => {
    expect(isSuccessStatus(status)).toBe(true);
  });

  it.each([199, 300, 400, 500])('status %i → false', (status) => {
    expect(isSuccessStatus(status)).toBe(false);
  });
});
