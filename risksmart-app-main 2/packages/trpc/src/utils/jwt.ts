import type { Request } from 'express';
import type { GetVerificationKey, Params } from 'express-jwt';
import type { Algorithm, Jwt, Secret } from 'jsonwebtoken';
import { expressJwtSecret } from 'jwks-rsa';

import { logger } from './logger';

/**
 * Configuration for a specific JWT issuer
 */
export interface IssuerConfig {
  type: string;
  key: string | undefined;
  jwk_url: string | undefined;
}

/**
 * JWT configuration supporting both single and multi-issuer setups
 *
 * For backwards compatibility, single issuer configs use the top-level fields.
 * For multi-issuer support, use the `issuers` object to map issuer URLs to their configs.
 */
export interface JWTConfig {
  type: string | undefined;
  key: string | undefined;
  jwk_url: string | undefined;
  issuers?: Record<string, IssuerConfig>;
}

export const parseJWTConfig = (configStr: string): JWTConfig => {
  try {
    const parsed = JSON.parse(configStr) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      logger.error({ configStr }, 'JWT config must be an object');
      throw new Error('JWT config must be an object');
    }

    const parsedObj = parsed as Record<string, unknown>;

    // Check if we have issuers configuration
    const hasIssuers =
      parsedObj.issuers && typeof parsedObj.issuers === 'object';

    // Type is required only if no issuers are present (single issuer mode)
    if (!hasIssuers && typeof parsedObj.type !== 'string') {
      logger.error(
        {
          configStr,
          actualType: typeof parsedObj.type,
          actualValue: parsedObj.type,
        },
        'JWT config must have a type string when not using multi-issuer configuration'
      );
      throw new Error(
        'JWT config must have a type string when not using multi-issuer configuration'
      );
    }

    const config: JWTConfig = {
      type: parsedObj.type as string | undefined,
      key: parsedObj.key as string | undefined,
      jwk_url: parsedObj.jwk_url as string | undefined,
    };

    // Parse issuer configurations if present
    logger.debug('Parsing JWT issuers configuration');
    if (hasIssuers) {
      const issuersObj = parsedObj.issuers as Record<string, unknown>;
      const issuers: Record<string, IssuerConfig> = {};

      for (const [issuer, issuerConfigObj] of Object.entries(issuersObj)) {
        logger.debug({ issuer }, `Parsed JWT issuer configuration`);
        if (typeof issuerConfigObj === 'object' && issuerConfigObj !== null) {
          const issuerConfig = issuerConfigObj as Record<string, unknown>;

          if (typeof issuerConfig.type !== 'string') {
            logger.error(`Issuer ${issuer} config must have a type string`);
            throw new Error(`Issuer ${issuer} config must have a type string`);
          }

          issuers[issuer] = {
            type: issuerConfig.type,
            key: issuerConfig.key as string | undefined,
            jwk_url: issuerConfig.jwk_url as string | undefined,
          };
          logger.debug({ issuer }, `Parsed JWT issuer configuration`);
        }
      }

      config.issuers = issuers;
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error({ error, configStr }, 'Failed to parse JWT config as JSON');
      throw new Error(`Invalid JWT configuration JSON: ${error.message}`);
    }
    // Re-throw specific JWT configuration errors without wrapping them
    if (
      error instanceof Error &&
      (error.message.includes('JWT config must have a type string') ||
        error.message.includes('Issuer') ||
        error.message.includes('JWT config must be an object'))
    ) {
      throw error;
    }
    logger.error({ error, configStr }, 'Failed to parse JWT config');
    throw new Error('Invalid JWT configuration');
  }
};

/**
 * Creates an express-jwt configuration object that supports dynamic issuer-based
 * secret and algorithm resolution.
 *
 * @param config - JWT configuration that can specify multiple issuers
 * @returns Params object for use with express-jwt middleware
 */
export const createExpressJWT = (config: JWTConfig): Params => {
  // If we have issuer-specific configurations, use dynamic secret resolution
  if (config.issuers && Object.keys(config.issuers).length > 0) {
    logger.info('Creating dynamic JWT configuration for multiple issuers');

    return createDynamicJWTConfig(config);
  }

  logger.info('Creating fallback JWT configuration');
  // Fallback to original single-issuer configuration
  if (config.jwk_url) {
    return {
      secret: expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.jwk_url,
      }),
      algorithms: [config.type as Algorithm],
    };
  } else if (config.key) {
    return {
      secret: config.key as Secret,
      // TODO: understand why the config is 512, but the key is 256
      // algorithms: [config.type as Algorithm],
      algorithms: ['RS256'],
    };
  } else {
    throw new Error('Invalid JWT configuration: key or jwk must be provided');
  }
};

/**
 * Creates a dynamic JWT configuration that resolves secrets based on the issuer claim.
 * This function examines the JWT payload to determine which issuer-specific configuration to use.
 */
const createDynamicJWTConfig = (config: JWTConfig): Params => {
  // Create a custom secret function that resolves based on issuer
  const secretFunction: GetVerificationKey = async (
    req: Request,
    token: Jwt | undefined
  ) => {
    try {
      // Extract issuer from the JWT payload
      const payload = token?.payload;
      const issuer =
        payload && typeof payload === 'object' && 'iss' in payload
          ? payload.iss
          : undefined;

      if (!issuer || typeof issuer !== 'string') {
        logger.warn('JWT token missing issuer claim');
        throw new Error('JWT token missing issuer claim');
      }

      logger.debug({ issuer }, 'Looking for issuer configuration');

      // Find matching issuer configuration
      // Normalize issuer URLs by trying both with and without trailing slash
      let issuerConfig = config.issuers?.[issuer];

      if (!issuerConfig) {
        // Try with trailing slash added
        const issuerWithSlash = issuer.endsWith('/') ? issuer : `${issuer}/`;
        logger.debug(
          { issuer, tryingIssuer: issuerWithSlash },
          'Trying issuer with trailing slash'
        );
        issuerConfig = config.issuers?.[issuerWithSlash];
      }

      if (!issuerConfig) {
        // Try with trailing slash removed
        const issuerWithoutSlash = issuer.endsWith('/')
          ? issuer.slice(0, -1)
          : issuer;
        logger.debug(
          { issuer, tryingIssuer: issuerWithoutSlash },
          'Trying issuer without trailing slash'
        );
        issuerConfig = config.issuers?.[issuerWithoutSlash];
      }

      if (!issuerConfig) {
        logger.debug(
          { issuer, availableIssuers: Object.keys(config.issuers || {}) },
          'No configuration found for JWT issuer, attempting fallback to static config'
        );

        // Fallback to top-level static configuration
        if (config.jwk_url) {
          logger.debug(
            { issuer, jwksUri: config.jwk_url },
            'Using fallback JWKS configuration'
          );

          const jwksClient = expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: config.jwk_url,
          });

          // Call the JWKS client function
          if (typeof jwksClient === 'function') {
            const result = (jwksClient as GetVerificationKey)(req, token);
            if (
              result &&
              typeof result === 'object' &&
              'then' in result &&
              typeof result.then === 'function'
            ) {
              return await result;
            } else {
              return result;
            }
          } else {
            return jwksClient;
          }
        }

        if (config.key) {
          logger.debug({ issuer }, 'Using fallback static key configuration');

          return config.key;
        }

        // No issuer config and no fallback config available
        logger.error(
          { issuer, availableIssuers: Object.keys(config.issuers || {}) },
          'No configuration found for JWT issuer and no fallback configuration available'
        );
        throw new Error(
          `No configuration found for issuer: ${issuer} and no fallback configuration available`
        );
      }

      // Handle JWKS URL configuration for matched issuer
      if (issuerConfig.jwk_url) {
        logger.debug(
          { issuer, jwksUri: issuerConfig.jwk_url },
          'Using JWKS for issuer'
        );

        const jwksClient = expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: issuerConfig.jwk_url,
        });

        // Call the JWKS client function
        if (typeof jwksClient === 'function') {
          const result = (jwksClient as GetVerificationKey)(req, token);
          if (
            result &&
            typeof result === 'object' &&
            'then' in result &&
            typeof result.then === 'function'
          ) {
            return await result;
          } else {
            return result;
          }
        } else {
          return jwksClient;
        }
      }

      // Handle static key configuration for matched issuer
      if (issuerConfig.key) {
        logger.debug({ issuer }, 'Using static key for issuer');

        return issuerConfig.key;
      }

      logger.warn(
        { issuer },
        'Issuer configuration missing both key and jwk_url'
      );
      throw new Error(`Invalid configuration for issuer: ${issuer}`);
    } catch (error) {
      logger.error({ error }, 'Error in dynamic JWT key resolution');
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  // Collect all possible algorithms from issuer configurations
  const allAlgorithms = new Set<Algorithm>();

  // Add default algorithm if present
  if (config.type) {
    allAlgorithms.add(config.type as Algorithm);
  }

  // Add algorithms from each issuer configuration
  Object.values(config.issuers || {}).forEach((issuerConfig) => {
    if (issuerConfig.type) {
      allAlgorithms.add(issuerConfig.type as Algorithm);
    }
  });

  // Fallback to common algorithms if none specified
  if (allAlgorithms.size === 0) {
    allAlgorithms.add('RS256');
    allAlgorithms.add('HS256');
  }

  return {
    secret: secretFunction,
    algorithms: Array.from(allAlgorithms),
  };
};
