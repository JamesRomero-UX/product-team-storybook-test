import express from 'express';

import { normalizeScopes } from '../auth/scopes.auth';
import type { RateLimitProfile } from '../config/rate-limiter.config';
import {
  DEFAULT_RATE_LIMIT_PROFILE,
  rateLimitProfiles,
} from '../config/rate-limiter.config';
import type { DynamoRateLimiter } from '../rate-limiter/dynamo.rate-limiter';
import type { AccountResponse } from '../schemas/account/account.schema';
import { AccountResponseSchema } from '../schemas/account/account.schema';
import type { DocumentationService } from '../services/documentation/documentation.service';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface AccountRouterProps {
  docsService: DocumentationService;
  rateLimiter: DynamoRateLimiter | null;
}

export const accountRouter = ({
  docsService,
  rateLimiter,
}: AccountRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createAsyncAuthedHandler(
      { requiredScopes: ['account:read'] },
      async (req, res) => {
        const auth = req.auth;
        const clientId = auth?.client_id ?? '';
        const clientKey = `cid:${clientId}`;
        const profile =
          (auth?.rl_profile as RateLimitProfile | undefined) ??
          DEFAULT_RATE_LIMIT_PROFILE;
        const profileConfig =
          rateLimitProfiles[profile] ??
          rateLimitProfiles[DEFAULT_RATE_LIMIT_PROFILE];

        // Convert JWT exp (seconds) to ms + UTC string
        const tokenExpiresAt = auth?.exp ? auth.exp * 1000 : 0;
        const tokenExpiresAtUtc = tokenExpiresAt
          ? new Date(tokenExpiresAt).toISOString()
          : new Date(0).toISOString();

        // Normalise comma-separated permissions string to array
        const permissions = normalizeScopes(auth?.permissions, ',');

        // Fetch current usage across all 4 tiers (parallel DynamoDB reads)
        const usageByTier = rateLimiter
          ? await rateLimiter.getUsage(clientKey, profile)
          : null;

        const buildTierUsage = (tier: keyof typeof profileConfig) => {
          const config = profileConfig[tier];
          const usage = usageByTier?.[tier] ?? null;

          return {
            points: config.points,
            durationSec: config.durationSec,
            currentUsage: usage
              ? {
                  consumed: usage.consumedPoints,
                  remaining: usage.remainingPoints,
                  resetAt: Math.ceil(Date.now() + (usage.msBeforeNext ?? 0)),
                }
              : null,
          };
        };

        const { signedDocsPath } = docsService.getSignedDocumentationPath();

        const response: AccountResponse = AccountResponseSchema.parse({
          orgId: auth?.org_id ?? '',
          clientId,
          role: auth?.role ?? null,
          tokenExpiresAt,
          tokenExpiresAtUtc,
          permissions,
          rateLimit: {
            profile,
            tiers: {
              t1: buildTierUsage('t1'),
              t2: buildTierUsage('t2'),
              t3: buildTierUsage('t3'),
              t4: buildTierUsage('t4'),
            },
          },
          documentation: { href: signedDocsPath },
        });

        res.json(response);
      }
    )
  );

  return router;
};
