import type { ManagementClient } from 'auth0';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getRoles = async (auth0Client: ManagementClient) => {
  const response = await auth0Client.roles.getAll();
  if (response.status !== 200) {
    logger.error('Error getting user roles from Auth0', { response });
    throw new Error('Error getting user roles from Auth0');
  }

  return response.data;
};
