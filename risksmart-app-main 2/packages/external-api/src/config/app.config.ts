import { ZodError } from 'zod';

import { serializeZodError } from '../utils/schemas';
import { getEnv, parseEnvJson } from '../utils/environment';
import { logger } from '../utils/logger';
import {
  AppAuthConfig,
  AppAuthSchema,
  AppDataConfig,
  AppDataSchema,
  type GraphqlMutationConfig,
  GraphqlMutationConfigSchema,
} from '../schemas/app-config/app-config.schema';

const defaultDataBreakerConfig = {
  threshold: 5,
  resetTimeoutMs: 6000,
  retryAttempts: 3,
  backoffBaseDelayMs: 1000,
  maxConcurrency: 10,
  maxQueueSize: 100,
};

const defaultAuthBreakerConfig = {
  threshold: 5,
  resetTimeoutMs: 3000,
  retryAttempts: 2,
  backoffBaseDelayMs: 2000,
  maxConcurrency: 5,
  maxQueueSize: 150,
};

export function generateAppAuthConfig() {
  let authConfig: AppAuthConfig;
  try {
    const localKeysJson = parseEnvJson('JWK_LOCAL_KEYS', false, []);
    const authConfigValue = parseEnvJson<Record<string, string>>(
      'AUTH_CONFIG',
      true
    );
    const authJwtProviders = parseEnvJson<unknown>('AUTH_JWT_PROVIDERS', true);
    const authBreakerConfig = parseEnvJson('AUTH_BREAKER_CONFIG', false, null);
    const allowedRSUserRoles = parseEnvJson('ALLOWED_RS_USER_ROLES', false, []);
    const docsSigningKey = getEnv('API_DOCS_SIGNING_KEY');
    const docsExpiryHrs = parseInt(
      getEnv('API_DOCS_EXPIRY_HRS', true) ?? '24',
      10
    );
    const orgClientLimit = parseInt(
      getEnv('ORG_CLIENT_LIMIT', true) || '5',
      10
    );
    authConfig = AppAuthSchema.parse({
      ...authConfigValue,
      jwkProviders: authJwtProviders,
      localKeys: localKeysJson,
      breakerPolicy: authBreakerConfig || defaultAuthBreakerConfig,
      orgClientLimit,
      allowedRSUserRoles,
      docsSigningKey,
      docsExpiryHrs,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        { error, zodErrors: serializeZodError(error) },
        'Failed to validate auth config'
      );
    } else {
      logger.error({ error }, 'Failed to generate auth config');
    }
    throw error;
  }
  return authConfig;
}

export function generateAppConfig() {
  let appDataConfig: AppDataConfig;
  try {
    const rateLimitTableName =
      getEnv('RATE_LIMIT_TBL_NAME', true) ?? 'ext-api-rate-limit-tbl';
    const dataClientValue = getEnv('DATA_CLIENT_TYPE');
    const trpcUrlValue = getEnv('TRPC_SERVICE_BASE_URL', true);
    const version = getEnv('PACKAGE_VERSION');
    const dataBreakerConfig = parseEnvJson('DATA_BREAKER_CONFIG', false);
    const basePath = getEnv('APP_BASE_PATH', true) || '/api/v1';
    const requestPageLimit = parseInt(
      getEnv('REQ_PAGE_LIMIT', true) || '250',
      10
    );
    const responseCompressionLevel = parseInt(
      getEnv('RESPONSE_COMPRESSION_LEVEL', true) || '6',
      10
    );
    const rateLimiterEnabled =
      (getEnv('ENABLE_RATE_LIMITER', true) ?? 'true') === 'true';
    const dynamoDBEndpoint = getEnv('DYNAMO_ENDPOINT', true);
    const trustProxyEnabled =
      (getEnv('ENABLE_TRUST_PROXY', true) ?? 'true') === 'true';
    const appDomain = getEnv('APP_DOMAIN');
    const configData = {
      clientType: dataClientValue,
      breakerPolicy: dataBreakerConfig || defaultDataBreakerConfig,
      rateLimitTableName,
      version,
      basePath,
      requestPageLimit,
      responseCompressionLevel,
      rateLimiterEnabled,
      trustProxyEnabled,
      dynamoDBEndpoint,
      appDomain,
      ...(trpcUrlValue ? { trpcUrl: trpcUrlValue } : {}),
    };

    appDataConfig = AppDataSchema.parse(configData);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        { error, zodErrors: serializeZodError(error) },
        'Failed to validate app data config'
      );
    } else {
      logger.error({ error }, 'Failed to generate app data config');
    }
    throw error;
  }
  return appDataConfig;
}

export function generateGraphqlMutationConfig(): GraphqlMutationConfig {
  try {
    return GraphqlMutationConfigSchema.parse({
      hasuraEndpoint: getEnv('HASURA_ENDPOINT'),
      hasuraAdminSecret: getEnv('HASURA_ADMIN_SECRET'),
      userId: getEnv('HASURA_MUTATION_USER_ID', true) || 'SYSTEM',
      roleName: getEnv('HASURA_MUTATION_ROLE_NAME', true) || 'RiskManager',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(
        { error, zodErrors: serializeZodError(error) },
        'Failed to validate GraphQL mutation config'
      );
    } else {
      logger.error({ error }, 'Failed to generate GraphQL mutation config');
    }
    throw error;
  }
}
