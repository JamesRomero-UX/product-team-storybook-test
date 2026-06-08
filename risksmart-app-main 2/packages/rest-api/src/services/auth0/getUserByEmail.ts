import type { ManagementClient } from 'auth0';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getUserByEmail = async (
  auth0Client: ManagementClient,
  email: string
) => {
  const response = await auth0Client.usersByEmail.getByEmail({ email });
  if (response.status !== 200) {
    logger.error('Error getting users from Auth0', { response });
    throw new Error('Error getting users from Auth0');
  }
  if (response.data.length > 1) {
    throw new Error('Multiple users found in Auth0 for email address');
  }

  return response.data.length ? response.data[0] : null;
};
