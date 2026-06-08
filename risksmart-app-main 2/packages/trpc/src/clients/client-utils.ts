import type { ServiceContext } from '../services/service.types';
import { logger } from '../utils/logger';
import { signRequest } from '../utils/sign-request';
import { CachedSsmParameter } from '../utils/ssm-parameter-client';

// Used to skip IAM request signing in local development
const isLocal = process.env.IS_LOCAL === 'true';

/**
 * Context for API requests containing tenant and user information.
 * Used by data layer, request state and AI feedback API clients.
 */
export interface ApiRequestContext {
  tenant: string;
  orgKey: string;
  userId: string;
}

/**
 * Converts ServiceContext to ApiRequestContext for API calls.
 * Maps orgId from ServiceContext to orgKey expected by the APIs.
 */
export function toApiContext(ctx: ServiceContext): ApiRequestContext {
  return {
    tenant: ctx.tenant,
    orgKey: ctx.orgId,
    userId: ctx.userId,
  };
}

/**
 * Creates a new instance of the CachedSsmParameter
 * @param ssmParameterEnvironmentVariableName The name of the environment variable that stores the
 * name of the SSM parameter
 * @returns The new instance
 */
export function createCachedSsmParameter(
  ssmParameterEnvironmentVariableName: string
): CachedSsmParameter {
  const paramName = process.env[ssmParameterEnvironmentVariableName];

  if (!paramName) {
    throw new Error(
      `${ssmParameterEnvironmentVariableName} environment variable is not set`
    );
  }

  return new CachedSsmParameter(paramName);
}

export async function getUrlFromSsmParam(
  parameter: CachedSsmParameter
): Promise<string> {
  if (!parameter) {
    throw new Error('parameter is null or undefined');
  }

  return await parameter.getValue();
}

/**
 * Gets headers for API requests.
 * In production, signs requests with AWS SigV4 for IAM authentication.
 * In local development, skips signing as the local Lambda servers don't enforce IAM auth.
 */
export async function getRequestHeaders(
  url: string,
  method: string,
  baseHeaders: Record<string, string>,
  body = ''
): Promise<Record<string, string>> {
  if (isLocal) {
    // Local services don't require IAM authentication, skip signing
    logger.debug('Skipping request signing for local development');

    return baseHeaders;
  }

  // Production: sign with AWS SigV4
  return signRequest(url, method, baseHeaders, body);
}
