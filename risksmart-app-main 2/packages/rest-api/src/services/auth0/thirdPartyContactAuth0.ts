import type { ManagementClient } from 'auth0';

import { getLogger } from '../../logger';

const logger = getLogger();

const statusIsSuccess = (code: number) => [200, 201, 202, 204].includes(code);

interface TriggerPasswordResetParams {
  auth0Client: ManagementClient;
  userId: string;
  resultUrl: string;
}

/**
 * Triggers a password reset for an Auth0 user and returns the password reset URL.
 */
export const triggerPasswordReset = async ({
  auth0Client,
  userId,
  resultUrl,
}: TriggerPasswordResetParams): Promise<string | undefined> => {
  logger.info('Triggering password reset', { userId });

  const ticketResponse = await auth0Client.tickets.changePassword({
    user_id: userId,
    result_url: resultUrl,
    mark_email_as_verified: true,
  });

  if (statusIsSuccess(ticketResponse.status)) {
    return ticketResponse.data.ticket;
  }

  logger.error('Error creating password reset ticket', { ticketResponse });

  return undefined;
};

interface RemoveUsersFromOrgParams {
  auth0Client: ManagementClient;
  userIds: string[];
  orgId: string;
}

/**
 * Removes one or more users from an Auth0 organization.
 */
export const removeUsersFromOrg = async ({
  auth0Client,
  userIds,
  orgId,
}: RemoveUsersFromOrgParams): Promise<boolean> => {
  if (userIds.length === 0) {
    return true;
  }

  logger.info('Removing users from organization', { userIds, orgId });

  try {
    const response = await auth0Client.organizations.deleteMembers(
      { id: orgId },
      { members: userIds }
    );

    if (statusIsSuccess(response.status)) {
      logger.info('Successfully removed users from organization', {
        userIds,
        orgId,
      });

      return true;
    }

    logger.error('Error removing users from organization', { response });

    return false;
  } catch (error) {
    logger.error('Error removing users from organization', { error });

    return false;
  }
};
