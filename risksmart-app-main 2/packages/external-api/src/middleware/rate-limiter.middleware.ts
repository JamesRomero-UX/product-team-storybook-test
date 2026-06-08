import createHttpError from 'http-errors';

import { UnexpectedRateLimiterError } from '../errors/rate-limit.errors';
import type {
  DynamoRateLimiter,
  LimiterConsumeResult,
} from '../rate-limiter/dynamo.rate-limiter';
import { createMiddleware } from '../utils/createMiddleware';

export interface RateLimiterMiddlewareProps {
  rateLimiter: DynamoRateLimiter;
  excludePaths?: string[];
}

export const rateLimitMiddleware = ({
  rateLimiter,
  excludePaths = [],
}: RateLimiterMiddlewareProps) => {
  const excludedPathSet = new Set(excludePaths);

  return createMiddleware(async (req, res, next) => {
    const clientKey = req.auth?.client_id
      ? `cid:${req.auth?.client_id}`
      : `ip:${req.ip}`;
    const rateLimitProfile = req.auth?.rl_profile;

    // skip rate limiter if path is excluded.
    if (excludedPathSet.has(req.path)) {
      return next();
    }

    try {
      const limiterRes = await rateLimiter.consumeTier({
        reqMethod: req.method,
        reqPath: req.path,
        clientKey,
        profile: rateLimitProfile ?? undefined,
      });
      res.setHeader('X-RateLimit-Consumed', limiterRes.consumedPoints);
      res.setHeader('X-RateLimit-Remaining', limiterRes.remainingPoints);

      return next();
    } catch (limiterRes: unknown) {
      // failing open if rate limiter backend errors.
      if (limiterRes instanceof UnexpectedRateLimiterError) {
        req.requestLogger.error(
          { rateLimitProfile: rateLimitProfile ?? null, clientKey },
          limiterRes.message
        );
        res.setHeader('X-RateLimit-Mode', 'degraded-fail-open');

        return next();
      }

      if (limiterRes instanceof Error) {
        req.requestLogger.error(
          { error: limiterRes.message },
          'error when consuming rate limit'
        );

        return next(createHttpError(500, 'Internal server error'));
      }

      // Rate limit exceeded, return rate limit info.
      const { msBeforeNext, remainingPoints } =
        limiterRes as LimiterConsumeResult;
      const retryAfterSec = Math.max(
        1,
        Math.ceil((msBeforeNext ?? 1000) / 1000)
      );
      const resetTs = Math.ceil(Date.now() + (msBeforeNext ?? 1000));

      req.requestLogger.warn(
        {
          clientKey,
          profile: rateLimitProfile ?? null,
          retryAfterSec,
          retryAfterTimestamp: resetTs,
          remainingPoints,
          requestInfo: `${req.method} ${req.path}`,
        },
        'client rate limit exceeded on request'
      );

      res.setHeader('X-RateLimit-Profile', rateLimitProfile ?? 'unknown');
      res.setHeader('X-RateLimit-Remaining', remainingPoints ?? 'unknown');
      res.setHeader('Retry-After', `${retryAfterSec ?? 0}`);

      res.status(429).json({
        message: 'Rate limit exceeded, too many requests',
        profile: rateLimitProfile ?? null,
        retryAfterSec,
        retryAfterTimestamp: resetTs,
      });
    }
  });
};
