import type { RateLimiterRes } from 'rate-limiter-flexible';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UnexpectedRateLimiterError } from '../errors/rate-limit.errors';
import type { DynamoRateLimiter } from '../rate-limiter/dynamo.rate-limiter';
import {
  createMockNext,
  createMockRequest,
  createMockResponse,
} from '../testing/test-utils';
import type { Logger } from '../utils/logger';
import { rateLimitMiddleware } from './rate-limiter.middleware';

describe('rateLimitMiddleware', () => {
  // Common mock objects
  const createMockRateLimiterRes = (overrides: Partial<RateLimiterRes> = {}) =>
    ({
      remainingPoints: 99,
      msBeforeNext: 60000,
      consumedPoints: 1,
      isFirstInDuration: false,
      ...overrides,
    }) as RateLimiterRes;

  const mockConsumeSuccessResult = createMockRateLimiterRes();

  const mockRateLimitExceededResult = createMockRateLimiterRes({
    remainingPoints: 0,
    msBeforeNext: 30000,
    consumedPoints: 100,
  });

  let mockConsumeTier: ReturnType<typeof vi.fn>;
  let mockRateLimiter: DynamoRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

    mockConsumeTier = vi.fn().mockResolvedValue(mockConsumeSuccessResult);
    mockRateLimiter = {
      consumeTier: mockConsumeTier,
      getUsage: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('happy path - rate limit check passes', () => {
    it('should call next() when rate limit check succeeds', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should set rate limit headers on successful check', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Consumed', 1);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
    });

    it('should use client_id from auth for client key when available', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        auth: { client_id: 'test-client-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: 'cid:test-client-123',
        })
      );
    });

    it('should use IP address for client key when auth is not available', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '10.0.0.1',
        auth: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: 'ip:10.0.0.1',
        })
      );
    });

    it('should use IP address when auth exists but client_id is missing', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '172.16.0.1',
        auth: { org_id: 'org-123' }, // auth exists but no client_id
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: 'ip:172.16.0.1',
        })
      );
    });

    it('should pass rate limit profile from auth to consumeTier', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'POST',
        path: '/api/v1/risks',
        auth: { client_id: 'test-client', rl_profile: 'turbo' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: 'turbo',
        })
      );
    });

    it('should pass undefined profile when rl_profile is not set', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        auth: { client_id: 'test-client' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: undefined,
        })
      );
    });

    it('should pass request method and path to consumeTier', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'DELETE',
        path: '/api/v1/risks/123',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          reqMethod: 'DELETE',
          reqPath: '/api/v1/risks/123',
        })
      );
    });
  });

  describe('excluded paths', () => {
    it('should skip rate limiting for excluded paths', async () => {
      const middleware = rateLimitMiddleware({
        rateLimiter: mockRateLimiter,
        excludePaths: ['/health', '/ready'],
      });
      const req = createMockRequest({
        method: 'GET',
        path: '/health',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it('should apply rate limiting for non-excluded paths', async () => {
      const middleware = rateLimitMiddleware({
        rateLimiter: mockRateLimiter,
        excludePaths: ['/health'],
      });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalled();
    });

    it('should handle empty excludePaths array', async () => {
      const middleware = rateLimitMiddleware({
        rateLimiter: mockRateLimiter,
        excludePaths: [],
      });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalled();
    });

    it('should handle undefined excludePaths', async () => {
      const middleware = rateLimitMiddleware({
        rateLimiter: mockRateLimiter,
      });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalled();
    });

    it('should match excluded paths exactly', async () => {
      const middleware = rateLimitMiddleware({
        rateLimiter: mockRateLimiter,
        excludePaths: ['/health'],
      });
      const req = createMockRequest({
        method: 'GET',
        path: '/health/deep', // Should NOT match /health exactly
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalled();
    });
  });

  describe('rate limit exceeded (429)', () => {
    beforeEach(() => {
      mockConsumeTier.mockRejectedValue(mockRateLimitExceededResult);
    });

    it('should return 429 status when rate limit is exceeded', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should return rate limit exceeded JSON response', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
        auth: { rl_profile: 'cruise' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Rate limit exceeded, too many requests',
        profile: 'cruise',
        retryAfterSec: 30, // 30000ms / 1000 = 30
        retryAfterTimestamp: expect.any(Number) as number,
      });
    });

    it('should set rate limit headers on 429 response', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
        auth: { rl_profile: 'turbo' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Profile',
        'turbo'
      );
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '30');
    });

    it('should use "unknown" for profile header when rl_profile is not set', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Profile',
        'unknown'
      );
    });

    it('should set null profile in JSON response when rl_profile is not set', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: null,
        })
      );
    });

    it('should calculate retryAfterSec with minimum of 1 second', async () => {
      const lowMsResult = createMockRateLimiterRes({
        remainingPoints: 0,
        msBeforeNext: 500, // Less than 1 second
        consumedPoints: 100,
      });
      mockConsumeTier.mockRejectedValue(lowMsResult);

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfterSec: 1,
        })
      );
    });

    it('should log warning when rate limit is exceeded', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'POST',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
        auth: { rl_profile: 'cruise' },
      });
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: 'ip:192.168.1.1',
          profile: 'cruise',
          retryAfterSec: 30,
          remainingPoints: 0,
          requestInfo: 'POST /api/v1/risks',
        }),
        'client rate limit exceeded on request'
      );
    });

    it('should not call next() when rate limit is exceeded', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('UnexpectedRateLimiterError - fail open', () => {
    beforeEach(() => {
      mockConsumeTier.mockRejectedValue(new UnexpectedRateLimiterError());
    });

    it('should call next() and fail open on UnexpectedRateLimiterError', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should set degraded mode header on UnexpectedRateLimiterError', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Mode',
        'degraded-fail-open'
      );
    });

    it('should log error on UnexpectedRateLimiterError', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
        auth: { rl_profile: 'turbo', client_id: 'client-abc' },
      });
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          rateLimitProfile: 'turbo',
          clientKey: 'cid:client-abc',
        },
        'Rate limiter backend failure'
      );
    });

    it('should log null profile when rl_profile is not set', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      };
      req.requestLogger = mockLogger as unknown as Logger;
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          rateLimitProfile: null,
        }),
        expect.any(String)
      );
    });
  });

  describe('generic Error handling - 500', () => {
    it('should return 500 on generic Error', async () => {
      const genericError = new Error('Database connection failed');
      mockConsumeTier.mockRejectedValue(genericError);

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          message: 'Internal server error',
        })
      );
    });

    it('should handle Error subclasses (not UnexpectedRateLimiterError)', async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      mockConsumeTier.mockRejectedValue(new CustomError('Custom failure'));

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle undefined IP gracefully', async () => {
      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockConsumeTier).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: 'ip:undefined',
        })
      );
    });

    it('should handle msBeforeNext of 0', async () => {
      const zeroMsResult = createMockRateLimiterRes({
        remainingPoints: 0,
        msBeforeNext: 0,
        consumedPoints: 100,
      });
      mockConsumeTier.mockRejectedValue(zeroMsResult);

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      // retryAfterSec should be minimum 1
      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '1');
    });

    it('should handle very large msBeforeNext values', async () => {
      const largeMsResult = createMockRateLimiterRes({
        remainingPoints: 0,
        msBeforeNext: 3600000, // 1 hour
        consumedPoints: 100,
      });
      mockConsumeTier.mockRejectedValue(largeMsResult);

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '3600');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfterSec: 3600,
        })
      );
    });

    it('should correctly calculate retryAfterTimestamp', async () => {
      mockConsumeTier.mockRejectedValue(mockRateLimitExceededResult);

      const middleware = rateLimitMiddleware({ rateLimiter: mockRateLimiter });
      const req = createMockRequest({
        method: 'GET',
        path: '/api/v1/risks',
        ip: '192.168.1.1',
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      const expectedTimestamp = Math.ceil(
        new Date('2024-01-15T12:00:00.000Z').getTime() + 30000
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfterTimestamp: expectedTimestamp,
        })
      );
    });
  });

  describe('multiple middleware instances', () => {
    it('should create independent middleware instances', async () => {
      const mockConsumeTier1 = vi
        .fn()
        .mockResolvedValue(mockConsumeSuccessResult);
      const mockConsumeTier2 = vi
        .fn()
        .mockResolvedValue(mockConsumeSuccessResult);

      const middleware1 = rateLimitMiddleware({
        rateLimiter: { consumeTier: mockConsumeTier1, getUsage: vi.fn() },
        excludePaths: ['/health'],
      });

      const middleware2 = rateLimitMiddleware({
        rateLimiter: { consumeTier: mockConsumeTier2, getUsage: vi.fn() },
        excludePaths: ['/ready'],
      });

      const req1 = createMockRequest({ path: '/health', ip: '1.1.1.1' });
      const req2 = createMockRequest({ path: '/ready', ip: '2.2.2.2' });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware1(req1, res, next);
      await middleware2(req2, res, next);

      // middleware1 should skip /health, middleware2 should skip /ready
      expect(mockConsumeTier1).not.toHaveBeenCalled();
      expect(mockConsumeTier2).not.toHaveBeenCalled();
    });
  });
});
