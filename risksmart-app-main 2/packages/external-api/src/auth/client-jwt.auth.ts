import type { Request } from 'express';
import type { GetVerificationKey, Params } from 'express-jwt';
import createHttpError from 'http-errors';
import type { ExpressJwtOptions } from 'jwks-rsa';
import { expressJwtSecret, SigningKeyNotFoundError } from 'jwks-rsa';

import type { AppAuthClientConfig } from '../schemas/app-config/app-config.schema';
import { logger } from '../utils/logger';

// creates signing key error handler for a specific issuer.
const createSigningKeyErrorHandler =
  (issuer: string) =>
  (err: Error | null, cb: (error: Error | null) => void) => {
    if (err instanceof SigningKeyNotFoundError) {
      logger.error({ err, issuer }, 'JWK token validation failed');

      return cb(createHttpError(401, 'Token validation failed'));
    }
    logger.error({ err, issuer }, 'JWK validation error');

    return cb(createHttpError(500, 'Internal Server Error'));
  };

// Creates JWT params that support multiple issuers by using a dynamic secret function.
// The function checks the token's issuer claim and returns the appropriate JWKS client.
export const createMultiIssuerJWTParams = (
  config: AppAuthClientConfig
): Params => {
  // Create a map of issuer, JWKS secret getter
  const issuerSecretMap = new Map<string, GetVerificationKey>();
  const algorithms = new Set<AppAuthClientConfig['jwkProviders'][0]['alg']>();
  const {
    jwkEnableCache = true,
    jwkRateLimit = true,
    jwkRequestPerMin = 5,
    jwkCacheExpirySec = 600,
    jwkProviders = [],
    localKeys = [],
  } = config;

  jwkProviders.forEach((providerConfig, index) => {
    const { issuer, jwkUri, alg } = providerConfig;
    algorithms.add(alg);
    const jwkOptions: ExpressJwtOptions = {
      cache: jwkEnableCache,
      cacheMaxAge: jwkCacheExpirySec * 1000,
      rateLimit: jwkRateLimit,
      jwksRequestsPerMinute: jwkRequestPerMin,
      jwksUri: jwkUri,
    };

    // Add error handler for token validation
    jwkOptions.handleSigningKeyError = createSigningKeyErrorHandler(issuer);

    // Add local keys interceptor only to the first provider
    if (localKeys.length > 0 && index === 0) {
      jwkOptions.getKeysInterceptor = () => {
        return Promise.resolve(localKeys);
      };
      logger.info(
        { kIds: localKeys.map((key) => key.kid), issuer },
        `Added local jwk keys for issuer ${issuer}`
      );
    }

    logger.info({ issuer, jwkUri }, 'Added JWT Auth issuer info');
    issuerSecretMap.set(issuer, expressJwtSecret(jwkOptions));
  });

  // Dynamic secret function that selects the appropriate JWKS client based on issuer
  const getSecret: GetVerificationKey = async (req: Request, token) => {
    // Reject invalid token payloads immediately
    if (typeof token?.payload === 'string' || !token?.payload) {
      logger.error({ token: token?.payload }, 'Invalid token payload');
      throw createHttpError(401, 'Invalid token payload');
    }

    const { iss } = token.payload;
    if (!iss) {
      logger.error({ token: token.payload }, 'Token missing issuer claim');
      throw createHttpError(401, 'Token missing issuer claim');
    }
    const issuer = iss.trim().replace(/\/$/, '');

    const secretGetter = issuerSecretMap.get(issuer);

    if (!secretGetter) {
      logger.error(
        { issuer, availableIssuers: Array.from(issuerSecretMap.keys()) },
        'Unknown JWT issuer'
      );
      throw createHttpError(401, 'Unknown issuer');
    }

    logger.debug({ issuer }, 'Validating token for issuer');

    return secretGetter(req, token);
  };

  return {
    secret: getSecret,
    algorithms: Array.from(algorithms),
  };
};
