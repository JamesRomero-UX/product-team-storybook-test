import type { Logger } from '@aws-lambda-powertools/logger';
import { permitSDK } from '@risksmart-app/permitio/src/permit-sdk';
import { Permit } from 'permitio';

import type { PermitDependencies } from '../../types';
import { getApiKey } from '../secrets-manager';
import { pdpEndpoint, secretName } from './constants';

// Cache for Permit dependencies at module level (persists across warm Lambda invocations)
let cachedPermitDeps: PermitDependencies | null = null;
let initPromise: Promise<PermitDependencies> | null = null;

export const createPermitDependencies = async (
  logger: Logger
): Promise<PermitDependencies> => {
  // Return cached dependencies if available
  if (cachedPermitDeps) {
    logger.debug('Returning cached Permit dependencies');

    return cachedPermitDeps;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    logger.debug('Waiting for in-flight Permit initialization');

    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    const apiKey = await getApiKey(secretName);

    if (!apiKey) {
      throw new Error('Failed to retrieve PDP API key');
    }

    logger.debug('Successfully retrieved PDP API key', {
      secretName,
    });

    const permit = new Permit({
      pdp: pdpEndpoint,
      token: apiKey,
    });

    const permitRsSDK = permitSDK(apiKey);

    cachedPermitDeps = { permit, permitRsSDK };

    return cachedPermitDeps;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
};
