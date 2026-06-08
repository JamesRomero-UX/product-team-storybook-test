import type { RateLimiterRes } from 'rate-limiter-flexible';
import { RateLimiterDynamo } from 'rate-limiter-flexible';

import type { AWSDynamoDBClient } from '../aws/dynamo-client';
import type {
  RateLimitProfile,
  RateLimitProfiles,
  RateLimitTier,
} from '../config/rate-limiter.config';
import {
  InvalidRateLimiterOptionError,
  UnexpectedRateLimiterError,
} from '../errors/rate-limit.errors';
import { logger } from '../utils/logger';

interface DynamoDBRateLimiterProps {
  dynamoClient: AWSDynamoDBClient;
  rateLimitProfiles: RateLimitProfiles;
  tableName: string;
  basePath: string;
  defaultRateLimitProfile: RateLimitProfile;
  defaultConsumePoints: number;
}

interface RateLimiterForProfileProps {
  rateLimitTier: RateLimitTier;
  profile: RateLimitProfile;
}

interface ConsumeTierProps {
  clientKey: string;
  reqPath: string;
  reqMethod: string;
  points?: number;
  profile?: string;
}

export type DynamoRateLimiter = ReturnType<typeof dynamoRateLimiter>;
export type LimiterConsumeResult = RateLimiterRes;

export const dynamoRateLimiter = ({
  dynamoClient,
  rateLimitProfiles,
  tableName,
  basePath,
  defaultConsumePoints,
  defaultRateLimitProfile,
}: DynamoDBRateLimiterProps) => {
  // Rate limiters for profiles / tiers.
  const rateLimiterMap = new Map<`${string}:${string}`, RateLimiterDynamo>();

  // Normalize basePath: ensure it starts with / and has no trailing /
  const normalizedBasePath = `/${basePath.replace(/^\/|\/$/g, '')}`;

  // Applies rules to req method & path to return tier.
  const tierFromRequestRules = (
    reqPath: string,
    reqMethod: string
  ): RateLimitTier => {
    const methodUpper = reqMethod.toUpperCase();
    // Auth or api account info requests.
    if (reqPath.startsWith(`${normalizedBasePath}/auth`)) {
      return 't1';
    }
    // Delete actions and any batch or account endpoints.
    if (
      methodUpper === 'DELETE' ||
      reqPath.includes('/batch') ||
      reqPath.startsWith(`${normalizedBasePath}/account`)
    ) {
      return 't2';
    }
    // Mutation endpoint methods.
    if (
      methodUpper === 'POST' ||
      methodUpper === 'PUT' ||
      methodUpper === 'PATCH'
    ) {
      return 't3';
    }

    // default for all reads, etc.
    return 't4';
  };

  // Returns a rate limiter with config from tier & profile.
  const getRateLimiterForProfile = ({
    rateLimitTier,
    profile,
  }: RateLimiterForProfileProps) => {
    const tierConfig = rateLimitProfiles[profile][rateLimitTier];

    return new RateLimiterDynamo({
      storeClient: dynamoClient.dynamoDB,
      tableCreated: true,
      ttlSet: true,
      keyPrefix: `${profile}:${tierConfig.keyPrefix}`,
      points: tierConfig.points,
      duration: tierConfig.durationSec,
      tableName,
      // Important on ECS to reduce DynamoDB pressure during bursts:
      // blocks in-memory if DynamoDB returns ConsumedCapacity/throughput issues.
      // acts like an internal circuit breaker for the dynamo table.
      inMemoryBlockOnConsumed: tierConfig.points,
      inMemoryBlockDuration: Math.min(10, tierConfig.durationSec),
    });
  };

  const consumeTier = async ({
    reqMethod,
    reqPath,
    clientKey,
    profile = defaultRateLimitProfile,
    points = defaultConsumePoints,
  }: ConsumeTierProps): Promise<LimiterConsumeResult> => {
    const matchedTier = tierFromRequestRules(reqPath, reqMethod);
    const rateLimiterForTier = rateLimiterMap.get(`${profile}:${matchedTier}`);
    const rateLimitInfo = {
      clientKey,
      profile,
      matchedTier,
      rateKey: clientKey,
      reqMethod,
      reqPath,
      requestedPoints: points,
    };

    if (!rateLimiterForTier) {
      logger.error(
        rateLimitInfo,
        'Failed to match rate limiter profile to requested'
      );
      throw new InvalidRateLimiterOptionError();
    }

    try {
      const consumeResult = await rateLimiterForTier.consume(clientKey, points);

      return consumeResult;
    } catch (err: unknown) {
      const isRateLimitResponse = (err: unknown): err is RateLimiterRes => {
        return (
          typeof err === 'object' &&
          err !== null &&
          'remainingPoints' in err &&
          'msBeforeNext' in err
        );
      };
      if (isRateLimitResponse(err)) {
        logger.warn(
          {
            consumeInfo: err,
            ...rateLimitInfo,
          },
          'rate limit reached for rateKey'
        );

        throw err;
      }
      logger.error(
        {
          error: err,
          ...rateLimitInfo,
        },
        'unexpected rate limiter error'
      );
      // unexpected err, throw formatted error.
      throw new UnexpectedRateLimiterError();
    }
  };

  // Create rate limiters from config.
  const createRateLimiters = () => {
    for (const profileKey in rateLimitProfiles) {
      for (const tierKey in rateLimitProfiles[profileKey as RateLimitProfile]) {
        const tier = tierKey as RateLimitTier;
        const profile = profileKey as RateLimitProfile;
        rateLimiterMap.set(
          `${profile}:${tier}`,
          getRateLimiterForProfile({ rateLimitTier: tier, profile })
        );
      }
    }
    logger.debug(
      {
        rateLimiterCount: rateLimiterMap.size,
        rateLimiters: [...rateLimiterMap.keys()],
      },
      'rate limiters added to setup'
    );
  };

  const getUsage = async (
    clientKey: string,
    profile: RateLimitProfile
  ): Promise<Record<RateLimitTier, RateLimiterRes | null>> => {
    const tiers: RateLimitTier[] = ['t1', 't2', 't3', 't4'];
    const results = await Promise.all(
      tiers.map(async (tier) => {
        const limiter = rateLimiterMap.get(`${profile}:${tier}`);
        if (!limiter) {
          return null;
        }
        try {
          return await limiter.get(clientKey);
        } catch (err) {
          logger.warn(
            { err, clientKey, profile, tier },
            'Failed to read rate limit usage from DynamoDB'
          );

          return null;
        }
      })
    );

    return Object.fromEntries(
      tiers.map((tier, i) => [tier, results[i]])
    ) as Record<RateLimitTier, RateLimiterRes | null>;
  };

  // init rate limiters.
  createRateLimiters();

  return {
    consumeTier,
    getUsage,
  };
};
