import { z, ZodIssueCode } from 'zod';

import type { DistributiveOmit } from '../../types/schema';
import { base64urlNoPad } from '../../utils/schemas';

const validAlgTypes = ['RS256'] as const;
const validDataClientTypes = ['trpc', 'mock'] as const;

export const JSONWebKeySchema = z.object({
  kty: z.literal('RSA'),
  n: base64urlNoPad,
  e: base64urlNoPad,
  alg: z.enum(validAlgTypes),
  kid: z.string().min(3, 'kid must be at least 3 characters'),
});

export const AppBreakerPolicySchema = z.object({
  threshold: z.number().min(1, 'at least 1 break threshold'),
  resetTimeoutMs: z
    .number()
    .min(100, 'at least 100ms timeout before breaker reset'),
  retryAttempts: z.number().min(1, 'at least 1 max retry attempts'),
  backoffBaseDelayMs: z
    .number()
    .min(100, 'at least 100ms delay before retrying'),
  maxConcurrency: z.number().min(1, 'at least 1 concurrent call'),
  maxQueueSize: z.number().min(5, 'at least 5 calls to queue'),
});

const CognitoAuthSchema = z.object({
  clientType: z.literal('cognito'),
  authTableName: z.string({
    message: 'table name required for cognito client',
  }),
  userPoolId: z.string({ message: 'userPool id required for cognito client' }),
});

const MockAuthSchema = z.object({
  clientType: z.literal('mock'),
});

const JWKProvidersSchema = z.object({
  issuer: z.string().url('Issuer URL resource required'),
  jwkUri: z.string().url('JWK URL resource required'),
  alg: z.enum(validAlgTypes),
});

const BaseAuthSchema = z.object({
  tokenUrl: z.string().url(),
  jwkProviders: z.array(JWKProvidersSchema),
  jwkRateLimit: z.boolean().optional(),
  jwkEnableCache: z.boolean().optional(),
  jwkCacheExpirySec: z.number().min(1).max(3600).optional(),
  jwkRequestPerMin: z.number().min(1).max(20).optional(),
  accessTokenExpiryHrs: z
    .number()
    .min(1, 'expiry must be at least 1 hr')
    .max(720, 'expiry limit is 30 days')
    .optional()
    .default(1),
  localKeys: z.array(JSONWebKeySchema),
  breakerPolicy: AppBreakerPolicySchema,
  orgClientLimit: z
    .number()
    .min(5, 'at least 5 auth client per org')
    .max(100, 'max client per org'),
  allowedRSUserRoles: z
    .array(z.string().min(1, 'RS role must be defined'))
    .min(1, 'at least 1 risksmart user role required'),
  docsSigningKey: z.string().min(64),
  docsExpiryHrs: z.number().min(1),
});

export const AppAuthSchema = z.discriminatedUnion('clientType', [
  BaseAuthSchema.merge(CognitoAuthSchema),
  BaseAuthSchema.merge(MockAuthSchema),
]);

export const AppDataSchema = z
  .object({
    clientType: z.enum(validDataClientTypes),
    breakerPolicy: AppBreakerPolicySchema,
    trpcUrl: z.string().url().optional(),
    version: z.string(),
    basePath: z.string(),
    requestPageLimit: z.number(),
    responseCompressionLevel: z.number().min(0).max(9),
    rateLimitTableName: z.string(),
    rateLimiterEnabled: z.boolean(),
    dynamoDBEndpoint: z.string().optional(),
    trustProxyEnabled: z.boolean(),
    appDomain: z.string(),
  })
  .superRefine((fields, ctx) => {
    if (fields.clientType === 'trpc') {
      if (!fields.trpcUrl) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: 'URL required for tRPC client',
          path: ['trpcUrl'],
        });
      }
    }
  });

export const GraphqlMutationConfigSchema = z.object({
  hasuraEndpoint: z.string().url('Hasura GraphQL endpoint URL required'),
  hasuraAdminSecret: z.string().min(1, 'Hasura admin secret required'),
  userId: z.string().min(1, 'User ID required for mutation client'),
  roleName: z.string().min(1, 'Role name required for mutation client'),
});

export type AppAuthConfig = z.infer<typeof AppAuthSchema>;
export type AppAuthClientConfig = DistributiveOmit<
  AppAuthConfig,
  'breakerPolicy'
>;
export type AppDataConfig = z.infer<typeof AppDataSchema>;
export type ClientDataConfig = DistributiveOmit<AppDataConfig, 'breakerPolicy'>;
export type AppBreakerPolicyConfig = z.infer<typeof AppBreakerPolicySchema>;
export type GraphqlMutationConfig = z.infer<typeof GraphqlMutationConfigSchema>;
