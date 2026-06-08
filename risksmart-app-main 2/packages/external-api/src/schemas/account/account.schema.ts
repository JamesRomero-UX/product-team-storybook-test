import { createResourceHref } from '../../utils/schemas';
import { z } from '../openapi.zod';

const AccountTierUsageSchema = z
  .object({
    consumed: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
    resetAt: z.number().int().nonnegative().openapi({
      description:
        'Unix timestamp in milliseconds when the rate limit window resets',
    }),
  })
  .nullable();

const AccountRateLimitTierSchema = z.object({
  points: z.number().int().positive().openapi({
    description: 'Maximum points allowed in the duration window',
  }),
  durationSec: z.number().int().positive().openapi({
    description: 'Duration of the rate limit window in seconds',
  }),
  currentUsage: AccountTierUsageSchema.openapi({
    description:
      'Current usage for this tier. Null when rate limiter is disabled or no requests have been made on this tier.',
  }),
});

const AccountRateLimitSchema = z.object({
  profile: z.string().openapi({
    description: 'Rate limit profile assigned to this API client',
    example: 'cruise',
  }),
  tiers: z
    .object({
      t1: AccountRateLimitTierSchema,
      t2: AccountRateLimitTierSchema,
      t3: AccountRateLimitTierSchema,
      t4: AccountRateLimitTierSchema,
    })
    .openapi({
      description:
        'Per-tier rate limit configuration and current usage. t1 = auth/account (most restrictive), t4 = standard reads (most permissive).',
    }),
});

export const AccountResponseSchema = z.object({
  orgId: z.string().openapi({ description: 'Organisation identifier' }),
  clientId: z.string().openapi({ description: 'API client identifier' }),
  role: z.string().nullable().openapi({
    description: 'Role assigned to this API client',
    example: 'rs-external',
  }),
  tokenExpiresAt: z.number().int().nonnegative().openapi({
    description: 'Token expiry as a Unix timestamp in milliseconds',
  }),
  tokenExpiresAtUtc: z.string().openapi({
    description: 'Token expiry as an ISO 8601 UTC string',
    example: '2025-02-19T12:00:00.000Z',
  }),
  permissions: z.array(z.string()).openapi({
    description: 'List of permission scopes granted to this API client',
  }),
  rateLimit: AccountRateLimitSchema,
  documentation: createResourceHref(
    '/api/v1/docs?sig=<signature>&exp=<unix-ms>'
  ).openapi({
    description: 'API documentation links',
  }),
});

export type AccountResponse = z.infer<typeof AccountResponseSchema>;
