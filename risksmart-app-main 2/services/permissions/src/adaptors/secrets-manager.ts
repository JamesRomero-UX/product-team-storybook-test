import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import { getLogger } from '../logger';

const logger = getLogger();
const secretsManager = new SecretsManagerClient({});

// Cache for secrets with TTL (5 minutes default)
const secretsCache = new Map<
  string,
  { value: string; timestamp: number; promise?: Promise<string> }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getApiKey = async (secretName: string): Promise<string> => {
  const now = Date.now();
  const cached = secretsCache.get(secretName);

  // Return cached value if still valid and not empty
  if (cached?.value && now - cached.timestamp < CACHE_TTL_MS) {
    logger.debug('Returning cached api key from Secrets Manager', {
      secretName,
    });

    return cached.value;
  }

  // If there's an in-flight request for this secret, wait for it
  if (cached?.promise) {
    logger.debug('Waiting for in-flight Secrets Manager request', {
      secretName,
    });

    return cached.promise;
  }

  logger.info('Retrieving api key from Secrets Manager', { secretName });

  const fetchPromise = (async () => {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });

    try {
      const response = await secretsManager.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret value is empty: ${secretName}`);
      }

      logger.info('Successfully retrieved api key from Secrets Manager');

      // Cache the successful result
      secretsCache.set(secretName, {
        value: response.SecretString,
        timestamp: Date.now(),
      });

      return response.SecretString;
    } catch (error) {
      // Remove the promise from cache on error so next call can retry
      secretsCache.delete(secretName);
      logger.error('Failed to retrieve api key from Secrets Manager', {
        error,
      });
      throw error;
    }
  })();

  // Store the promise in cache to deduplicate concurrent requests
  secretsCache.set(secretName, {
    value: '',
    timestamp: 0,
    promise: fetchPromise,
  });

  return fetchPromise;
};
