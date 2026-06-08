import { ManagementClient } from 'auth0';

import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';

let managementClient: ManagementClient | undefined;

export const getManagementClient = (): ManagementClient => {
  if (!managementClient) {
    managementClient = new ManagementClient({
      domain: getEnv('AUTH0_DOMAIN'),
      clientId: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
      clientSecret: getEnv('AUTH0_MANAGEMENT_CLIENT_SECRET'),
    });
  }

  return managementClient;
};

/**
 * Reset the cached ManagementClient so the next call to
 * getManagementClient() creates a fresh instance. Use this when a
 * Management API call fails with an auth error (e.g. 401) to recover
 * from a stale or expired internal token.
 */
export const resetManagementClient = (): void => {
  logger.info('Resetting Auth0 ManagementClient singleton');
  managementClient = undefined;
};
