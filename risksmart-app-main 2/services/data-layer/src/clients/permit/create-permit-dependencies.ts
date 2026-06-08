import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitClient } from '@risksmart-app/permitio/src/permit-client';
import { createPermitClient } from '@risksmart-app/permitio/src/permit-client';

import { getApiKey } from '../secrets-manager';
import { pdpEndpoint, secretName } from './constants';

export interface PermitDependencies {
  permitClient: PermitClient;
}

export const createPermitDependencies = async (
  logger: Logger
): Promise<PermitDependencies> => {
  logger.info('Initializing Permit dependencies', {
    pdpEndpoint,
  });

  const apiKey = await getApiKey(secretName);

  if (!apiKey) {
    throw new Error('Failed to retrieve PDP API key');
  }

  logger.info('Successfully retrieved PDP API key', {
    secretName,
  });

  const permitClient = createPermitClient(apiKey, pdpEndpoint);

  return { permitClient };
};
