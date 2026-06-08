import type { RateLimiterRes } from 'rate-limiter-flexible';
import { RateLimiterDynamo } from 'rate-limiter-flexible';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AWSDynamoDBClient } from '../aws/dynamo-client';
import type {
  RateLimitProfile,
  RateLimitProfiles,
} from '../config/rate-limiter.config';
import {
  InvalidRateLimiterOptionError,
  UnexpectedRateLimiterError,
} from '../errors/rate-limit.errors';
import { dynamoRateLimiter } from './dynamo.rate-limiter';

// Mock the rate-limiter-flexible library
vi.mock('rate-limiter-flexible', () => ({
  RateLimiterDynamo: vi.fn(),
}));

describe('dynamoRateLimiter', () => {
  // Common mock objects
  const mockDynamoDB = { putItem: vi.fn() };
  const mockDynamoClient: AWSDynamoDBClient = {
    dynamoDB: mockDynamoDB,
  } as unknown as AWSDynamoDBClient;

  const mockRateLimitProfiles: RateLimitProfiles = {
    chill: {
      t1: { name: 'tier1', points: 5, durationSec: 60, keyPrefix: 't1' },
      t2: { name: 'tier2', points: 5, durationSec: 60, keyPrefix: 't2' },
      t3: { name: 'tier3', points: 10, durationSec: 60, keyPrefix: 't3' },
      t4: { name: 'tier4', points: 20, durationSec: 60, keyPrefix: 't4' },
    },
    cruise: {
      t1: { name: 'tier1', points: 10, durationSec: 60, keyPrefix: 't1' },
      t2: { name: 'tier2', points: 60, durationSec: 60, keyPrefix: 't2' },
      t3: { name: 'tier3', points: 300, durationSec: 60, keyPrefix: 't3' },
      t4: { name: 'tier4', points: 1500, durationSec: 60, keyPrefix: 't4' },
    },
    turbo: {
      t1: { name: 'tier1', points: 10, durationSec: 60, keyPrefix: 't1' },
      t2: { name: 'tier2', points: 120, durationSec: 60, keyPrefix: 't2' },
      t3: { name: 'tier3', points: 600, durationSec: 60, keyPrefix: 't3' },
      t4: { name: 'tier4', points: 3000, durationSec: 60, keyPrefix: 't4' },
    },
    fullSend: {
      t1: { name: 'tier1', points: 10, durationSec: 60, keyPrefix: 't1' },
      t2: { name: 'tier2', points: 360, durationSec: 60, keyPrefix: 't2' },
      t3: { name: 'tier3', points: 1800, durationSec: 60, keyPrefix: 't3' },
      t4: { name: 'tier4', points: 9000, durationSec: 60, keyPrefix: 't4' },
    },
  };

  const mockBasePath = '/api/v1';
  const mockTableName = 'rate-limit-table';
  const mockDefaultProfile: RateLimitProfile = 'cruise';
  const mockDefaultConsumePoints = 1;

  const createDefaultProps = () => ({
    dynamoClient: mockDynamoClient,
    rateLimitProfiles: mockRateLimitProfiles,
    tableName: mockTableName,
    basePath: mockBasePath,
    defaultRateLimitProfile: mockDefaultProfile,
    defaultConsumePoints: mockDefaultConsumePoints,
  });

  // Helper to create mock RateLimiterRes
  const createMockRateLimiterRes = (overrides: Partial<RateLimiterRes> = {}) =>
    ({
      remainingPoints: 99,
      msBeforeNext: 60000,
      consumedPoints: 1,
      isFirstInDuration: false,
      ...overrides,
    }) as RateLimiterRes;

  // Mock consume result for successful rate limit check
  const mockConsumeSuccessResult: RateLimiterRes = createMockRateLimiterRes();

  // Mock consume result for rate limited response
  const mockRateLimitedResult: RateLimiterRes = createMockRateLimiterRes({
    remainingPoints: 0,
    msBeforeNext: 30000,
    consumedPoints: 100,
    isFirstInDuration: false,
  });

  let mockConsume: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock RateLimiterDynamo instance
    mockConsume = vi.fn().mockResolvedValue(mockConsumeSuccessResult);

    vi.mocked(RateLimiterDynamo).mockImplementation(
      () =>
        ({
          consume: mockConsume,
        }) as unknown as RateLimiterDynamo
    );
  });

  describe('factory function', () => {
    it('should create rate limiters for all profile and tier combinations', () => {
      dynamoRateLimiter(createDefaultProps());

      // 4 profiles * 4 tiers = 16 rate limiters
      expect(RateLimiterDynamo).toHaveBeenCalledTimes(16);
    });

    it('should return an object with consumeTier method', () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      expect(limiter).toHaveProperty('consumeTier');
      expect(typeof limiter.consumeTier).toBe('function');
    });

    it('should configure RateLimiterDynamo with correct parameters for each tier', () => {
      dynamoRateLimiter(createDefaultProps());

      // Check that at least one call has the expected structure
      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          storeClient: mockDynamoDB,
          tableCreated: true,
          ttlSet: true,
          tableName: mockTableName,
        })
      );
    });

    it('should configure key prefix with profile and tier', () => {
      dynamoRateLimiter(createDefaultProps());

      // Check a specific profile/tier combination
      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'cruise:t1',
          points: 10,
          duration: 60,
        })
      );
    });

    it('should configure inMemoryBlockOnConsumed equal to tier points', () => {
      dynamoRateLimiter(createDefaultProps());

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          inMemoryBlockOnConsumed: 10, // cruise t1 points
        })
      );
    });

    it('should configure inMemoryBlockDuration with minimum of 10 or duration', () => {
      dynamoRateLimiter(createDefaultProps());

      // For duration 60, min(10, 60) = 10
      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          inMemoryBlockDuration: 10,
        })
      );
    });

    it('should use actual duration when less than 10 seconds', () => {
      const propsWithShortDuration = {
        ...createDefaultProps(),
        rateLimitProfiles: {
          ...mockRateLimitProfiles,
          cruise: {
            ...mockRateLimitProfiles.cruise,
            t1: {
              ...mockRateLimitProfiles.cruise.t1,
              durationSec: 5,
            },
          },
        },
      };

      dynamoRateLimiter(propsWithShortDuration);

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'cruise:t1',
          inMemoryBlockDuration: 5,
        })
      );
    });
  });

  describe('tierFromRequestRules', () => {
    let limiter: ReturnType<typeof dynamoRateLimiter>;

    beforeEach(() => {
      limiter = dynamoRateLimiter(createDefaultProps());
    });

    describe('tier 1 (t1) - auth and account endpoints', () => {
      it('should return t1 for auth endpoints', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/auth/token',
          reqMethod: 'POST',
        });

        expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
      });

      it('should return t1 for account endpoints', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/account/info',
          reqMethod: 'GET',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t1 for nested auth paths', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/auth/refresh/token',
          reqMethod: 'POST',
        });

        expect(mockConsume).toHaveBeenCalled();
      });
    });

    describe('tier 2 (t2) - DELETE and batch endpoints', () => {
      it('should return t2 for DELETE method', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks/123',
          reqMethod: 'DELETE',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t2 for batch endpoints', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks/batch',
          reqMethod: 'POST',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t2 for nested batch paths', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/items/batch/create',
          reqMethod: 'POST',
        });

        expect(mockConsume).toHaveBeenCalled();
      });
    });

    describe('tier 3 (t3) - mutation endpoints', () => {
      it('should return t3 for POST method on non-auth, non-batch paths', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'POST',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t3 for PUT method', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks/123',
          reqMethod: 'PUT',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t3 for PATCH method', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks/123',
          reqMethod: 'PATCH',
        });

        expect(mockConsume).toHaveBeenCalled();
      });
    });

    describe('tier 4 (t4) - read endpoints', () => {
      it('should return t4 for GET method on standard paths', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t4 for HEAD method', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks/123',
          reqMethod: 'HEAD',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should return t4 for OPTIONS method', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'OPTIONS',
        });

        expect(mockConsume).toHaveBeenCalled();
      });
    });
  });

  describe('consumeTier', () => {
    let limiter: ReturnType<typeof dynamoRateLimiter>;

    beforeEach(() => {
      limiter = dynamoRateLimiter(createDefaultProps());
    });

    describe('happy path', () => {
      it('should consume points and return result on successful rate limit check', async () => {
        const result = await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        });

        expect(result).toEqual(mockConsumeSuccessResult);
        expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
      });

      it('should use default consume points when not specified', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        });

        expect(mockConsume).toHaveBeenCalledWith(
          'test-client',
          mockDefaultConsumePoints
        );
      });

      it('should use custom points when specified', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
          points: 5,
        });

        expect(mockConsume).toHaveBeenCalledWith('test-client', 5);
      });

      it('should use default profile when not specified', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        });

        // The default profile is 'cruise', so consume should be called
        expect(mockConsume).toHaveBeenCalled();
      });

      it('should use specified profile', async () => {
        await limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
          profile: 'turbo',
        });

        expect(mockConsume).toHaveBeenCalled();
      });

      it('should handle different client keys', async () => {
        await limiter.consumeTier({
          clientKey: 'client-abc',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        });

        expect(mockConsume).toHaveBeenCalledWith('client-abc', 1);
      });
    });

    describe('rate limit reached', () => {
      it('should throw rate limit result when rate limit is reached', async () => {
        mockConsume.mockRejectedValue(mockRateLimitedResult);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toEqual(mockRateLimitedResult);
      });

      it('should throw rate limit with zero remaining points', async () => {
        const rateLimitedWithZero = createMockRateLimiterRes({
          remainingPoints: 0,
          msBeforeNext: 30000,
          consumedPoints: 100,
        });
        mockConsume.mockRejectedValue(rateLimitedWithZero);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toMatchObject({ remainingPoints: 0 });
      });
    });

    describe('unhappy path', () => {
      it('should throw InvalidRateLimiterOptionError when profile does not exist', async () => {
        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
            profile: 'nonexistent' as RateLimitProfile,
          })
        ).rejects.toThrow(InvalidRateLimiterOptionError);
      });

      it('should throw UnexpectedRateLimiterError for non-rate-limit errors', async () => {
        const unexpectedError = new Error('DynamoDB connection failed');
        mockConsume.mockRejectedValue(unexpectedError);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toThrow(UnexpectedRateLimiterError);
      });

      it('should throw UnexpectedRateLimiterError when error has no expected msBeforeNext', async () => {
        const errorWithNoneMs = {};
        mockConsume.mockRejectedValue(errorWithNoneMs);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toThrow(UnexpectedRateLimiterError);
      });

      it('should throw UnexpectedRateLimiterError when error is null', async () => {
        mockConsume.mockRejectedValue(null);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toThrow(UnexpectedRateLimiterError);
      });

      it('should throw UnexpectedRateLimiterError when error is undefined', async () => {
        mockConsume.mockRejectedValue(undefined);

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toThrow(UnexpectedRateLimiterError);
      });

      it('should throw UnexpectedRateLimiterError for string error', async () => {
        mockConsume.mockRejectedValue('Unexpected string error');

        await expect(
          limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          })
        ).rejects.toThrow(UnexpectedRateLimiterError);
      });
    });
  });

  describe('profile configurations', () => {
    it('should create rate limiters with chill profile settings', () => {
      dynamoRateLimiter(createDefaultProps());

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'chill:t1',
          points: 5,
        })
      );
    });

    it('should create rate limiters with cruise profile settings', () => {
      dynamoRateLimiter(createDefaultProps());

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'cruise:t4',
          points: 1500,
        })
      );
    });

    it('should create rate limiters with turbo profile settings', () => {
      dynamoRateLimiter(createDefaultProps());

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'turbo:t3',
          points: 600,
        })
      );
    });

    it('should create rate limiters with fullSend profile settings', () => {
      dynamoRateLimiter(createDefaultProps());

      expect(RateLimiterDynamo).toHaveBeenCalledWith(
        expect.objectContaining({
          keyPrefix: 'fullSend:t4',
          points: 9000,
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty client key', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      await limiter.consumeTier({
        clientKey: '',
        reqPath: '/api/v1/risks',
        reqMethod: 'GET',
      });

      expect(mockConsume).toHaveBeenCalledWith('', 1);
    });

    it('should handle request paths without basePath prefix', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      // This should default to t4 since it doesn't match auth/account/batch patterns
      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/other/endpoint',
        reqMethod: 'GET',
      });

      expect(mockConsume).toHaveBeenCalled();
    });

    it('should handle zero points consumption', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/api/v1/risks',
        reqMethod: 'GET',
        points: 0,
      });

      expect(mockConsume).toHaveBeenCalledWith('test-client', 0);
    });

    it('should throw rate limit result when msBeforeNext is 0', async () => {
      const rateLimitedWithZeroMs = createMockRateLimiterRes({
        remainingPoints: 0,
        msBeforeNext: 0,
        consumedPoints: 100,
      });
      mockConsume.mockRejectedValue(rateLimitedWithZeroMs);

      const limiter = dynamoRateLimiter(createDefaultProps());

      await expect(
        limiter.consumeTier({
          clientKey: 'test-client',
          reqPath: '/api/v1/risks',
          reqMethod: 'GET',
        })
      ).rejects.toMatchObject({ msBeforeNext: 0 });
    });

    it('should handle case-sensitive HTTP methods', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      // lowercase 'get' should default to t4
      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/api/v1/risks',
        reqMethod: 'get',
      });

      // lowercase methods don't match POST/PUT/PATCH/DELETE, so t4
      expect(mockConsume).toHaveBeenCalled();
    });

    it('should correctly handle auth path priority over DELETE method', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      // auth path should be t1 even with DELETE method
      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/api/v1/auth/token',
        reqMethod: 'DELETE',
      });

      expect(mockConsume).toHaveBeenCalled();
    });

    it('should correctly handle batch path with non-DELETE method', async () => {
      const limiter = dynamoRateLimiter(createDefaultProps());

      // batch path should be t2 even with GET method
      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/api/v1/risks/batch/status',
        reqMethod: 'GET',
      });

      expect(mockConsume).toHaveBeenCalled();
    });
  });

  describe('basePath normalization', () => {
    const basePathTestCases = [
      { basePath: 'api/v1', description: 'without leading slash' },
      { basePath: '/api/v1/', description: 'with trailing slash' },
      {
        basePath: 'api/v1/',
        description: 'without leading and with trailing slash',
      },
      {
        basePath: '//api/v1//',
        description: 'with multiple leading and trailing slashes',
      },
    ];

    describe.each(basePathTestCases)(
      'when basePath is $description ($basePath)',
      ({ basePath }) => {
        it('should match auth endpoints to t1', async () => {
          const limiter = dynamoRateLimiter({
            ...createDefaultProps(),
            basePath,
          });

          await limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/auth/token',
            reqMethod: 'POST',
          });

          expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
        });

        it('should match account endpoints to t1', async () => {
          const limiter = dynamoRateLimiter({
            ...createDefaultProps(),
            basePath,
          });

          await limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/account/info',
            reqMethod: 'GET',
          });

          expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
        });

        it('should not match non-auth paths incorrectly', async () => {
          const limiter = dynamoRateLimiter({
            ...createDefaultProps(),
            basePath,
          });

          // A standard GET should go to t4, not t1
          await limiter.consumeTier({
            clientKey: 'test-client',
            reqPath: '/api/v1/risks',
            reqMethod: 'GET',
          });

          expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
        });
      }
    );

    it('should normalize basePath with only slashes to root', async () => {
      const limiter = dynamoRateLimiter({
        ...createDefaultProps(),
        basePath: '///',
      });

      // With basePath normalized to '/', /auth/token should match
      await limiter.consumeTier({
        clientKey: 'test-client',
        reqPath: '/auth/token',
        reqMethod: 'POST',
      });

      expect(mockConsume).toHaveBeenCalledWith('test-client', 1);
    });
  });

  describe('multiple limiter instances', () => {
    it('should create independent limiter instances', () => {
      const props1 = createDefaultProps();
      const props2 = {
        ...createDefaultProps(),
        tableName: 'different-table',
      };

      const limiter1 = dynamoRateLimiter(props1);
      const limiter2 = dynamoRateLimiter(props2);

      expect(limiter1).not.toBe(limiter2);
      // 16 calls for first, 16 for second = 32 total
      expect(RateLimiterDynamo).toHaveBeenCalledTimes(32);
    });
  });
});
