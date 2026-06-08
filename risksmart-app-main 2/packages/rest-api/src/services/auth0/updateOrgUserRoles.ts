import type { ManagementClient } from 'auth0';
import { ManagementApiError } from 'auth0';

import { getLogger } from '../../logger';
const logger = getLogger();

const addUserToAuth0Org = async (
  auth0Client: ManagementClient,
  orgKey: string,
  auth0UserId: string
) => {
  logger.info('Adding user to Auth0 organization', { orgKey, auth0UserId });
  try {
    const response = await auth0Client.organizations.addMembers(
      {
        id: orgKey,
      },
      {
        members: [auth0UserId],
      }
    );
    if (response.status !== 204) {
      logger.info('Could not add user to auth0 organization', { response });
      throw new Error('Error adding user to Auth0 organization');
    }
  } catch (error) {
    logger.error('Error adding user to Auth0 organization', { error });
    throw error;
  }
};

const getOrgUserRoles = async (
  auth0Client: ManagementClient,
  orgKey: string,
  auth0UserId: string
) => {
  logger.info('Getting user roles from Auth0', { orgKey, auth0UserId });
  try {
    const response = await auth0Client.organizations.getMemberRoles({
      id: orgKey,
      user_id: auth0UserId,
    });
    if (response.status !== 200) {
      logger.error('Error getting user roles from Auth0', { response });
      throw new Error('Error getting user roles from Auth0');
    }

    return response.data;
  } catch (error) {
    if (error instanceof ManagementApiError) {
      if (error.statusCode === 404) {
        logger.info('User not found in Auth0', { error });
        await addUserToAuth0Org(auth0Client, orgKey, auth0UserId);

        return [];
      }
    }
    logger.error('Error getting user roles from Auth0', { error });
    throw error;
  }
};

const deleteOrgUserRoles = async (
  auth0Client: ManagementClient,
  orgKey: string,
  auth0UserId: string,
  roleIds: string[]
) => {
  logger.info('Deleting user roles in Auth0', { orgKey, auth0UserId, roleIds });
  const response = await auth0Client.organizations.deleteMemberRoles(
    {
      id: orgKey,
      user_id: auth0UserId,
    },
    {
      roles: roleIds,
    }
  );
  if (response.status !== 204) {
    logger.error('Error deleting user roles in Auth0', { response });
    throw new Error('Error deleting user roles in Auth0');
  }
};

const addOrgUserRoles = async (
  auth0Client: ManagementClient,
  orgKey: string,
  auth0UserId: string,
  roleIds: string[]
) => {
  logger.info('Adding user roles in Auth0', { orgKey, auth0UserId, roleIds });
  const response = await auth0Client.organizations.addMemberRoles(
    {
      id: orgKey,
      user_id: auth0UserId,
    },
    {
      roles: roleIds,
    }
  );
  if (response.status !== 204) {
    logger.error('Error deleting user roles in Auth0', { response });
    throw new Error('Error deleting user roles in Auth0');
  }
};

export const updateOrgUserRoles = async (
  auth0Client: ManagementClient,
  orgKey: string,
  auth0UserId: string,
  newRoleIds: string[]
) => {
  const existingRoles = await getOrgUserRoles(auth0Client, orgKey, auth0UserId);
  logger.info('Existing roles', { existingRoles });

  if (existingRoles.length) {
    await deleteOrgUserRoles(
      auth0Client,
      orgKey,
      auth0UserId,
      existingRoles.map((role) => role.id)
    );
  }

  if (newRoleIds.length) {
    await addOrgUserRoles(auth0Client, orgKey, auth0UserId, newRoleIds);
  }

  const newRoles = await getOrgUserRoles(auth0Client, orgKey, auth0UserId);
  logger.info('New roles', { newRoles });

  return newRoles;
};
