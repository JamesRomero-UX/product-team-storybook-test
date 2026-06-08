import { BadRequest, NotFound } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import type { ActionInput } from 'src/hasuraActionHelpers';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { updateOrgUserRoles } from 'src/services/auth0/updateOrgUserRoles';
import { getOrgFeatures } from 'src/services/orgUtilities';
import {
  deleteUserRolesByIds,
  getUserById,
  getUserRoles,
  insertUserRoles,
  updateUser,
} from 'src/services/user/userService';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { PatchSchema } from './schema';
import { patchSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(patchSchema, async (body) => {
  logger.debug('body', { body });
  const sessionData = getSessionData(body.session_variables);

  // Check if trpc feature flag is enabled
  const features = await getOrgFeatures({
    orgKey: sessionData.orgKey,
    tenant: sessionData.tenant,
  });

  if (features.includes('trpc')) {
    logger.info('Using new role system (trpc enabled)');

    return await handleNewRoleSystem(body, sessionData);
  }

  // Use the existing Auth0 role system
  logger.info('Using existing role system (trpc disabled)');

  return await handleExistingRoleSystem(body, sessionData);
});

interface SessionData {
  orgKey: string;
  userId: string;
  tenant: string;
}

async function handleNewRoleSystem(
  body: ActionInput<PatchSchema>,
  sessionData: SessionData
) {
  const hasuraClient = getHasuraBackendClientForAction(body);

  // Get user from Hasura
  const user = await getUserById(hasuraClient, body.input.userId);
  if (!user) {
    throw new NotFound('User not found');
  }

  const userOrg = user.organisationusers.find(
    (ou) => ou.OrgKey === sessionData.orgKey
  );
  if (!userOrg) {
    throw new BadRequest(
      'Cannot change roles for user outside your organisation'
    );
  }

  // Get current user roles
  const currentUserRoles = await getUserRoles(hasuraClient, {
    userId: user.Id,
    orgKey: sessionData.orgKey,
  });

  // Extract current role keys
  const currentRoleKeys = currentUserRoles.map((ur) => ur.RoleKey);
  const submittedRoleKeys = body.input.roleIds;

  logger.info('Current roles', {
    currentRoleKeys,
    submittedRoleKeys,
  });
  // Find roles to delete (current roles not in submitted roles)
  const rolesToDelete = currentUserRoles.filter(
    (ur) => !submittedRoleKeys.includes(ur.RoleKey)
  );

  // Find roles to add (submitted roles not in current roles)
  const rolesToAdd = submittedRoleKeys.filter(
    (roleKey) => !currentRoleKeys.includes(roleKey)
  );

  // Delete roles that are no longer needed
  if (rolesToDelete.length > 0) {
    // Ensure to delete the user roles by ID, not key.
    const roleIdsToDelete = rolesToDelete.map((ur) => ur.Id);
    await deleteUserRolesByIds(hasuraClient, {
      ids: roleIdsToDelete,
    });
  }

  // Insert new user roles
  if (rolesToAdd.length > 0) {
    const userRoleObjects = rolesToAdd.map((roleKey: string) => ({
      Id: crypto.randomUUID(),
      UserId: body.input.userId,
      RoleKey: roleKey,
      OrgKey: sessionData.orgKey,
    }));

    await insertUserRoles(hasuraClient, {
      objects: userRoleObjects,
    });
  }

  // Get all current roles after the changes (including unchanged ones)
  const finalUserRoles = await getUserRoles(hasuraClient, {
    userId: user.Id,
    orgKey: sessionData.orgKey,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      roles:
        finalUserRoles.map((ur) => ({
          id: ur.RoleKey,
          name: ur.role_type.Name,
          description: ur.role_type.Description || '',
        })) || [],
    }),
  };
}

async function handleExistingRoleSystem(
  body: ActionInput<PatchSchema>,
  sessionData: SessionData
) {
  const hasuraClient = getHasuraBackendClientForAction(body);

  // Get user from Hasura
  const user = await getUserById(hasuraClient, body.input.userId);
  if (!user) {
    throw new NotFound('User not found');
  }

  if (!user.Email) {
    throw new BadRequest(
      'Cannot change role for user without an email address'
    );
  }

  const userOrg = user.organisationusers.find(
    (ou) => ou.OrgKey === sessionData.orgKey
  );
  if (!userOrg) {
    throw new BadRequest(
      'Cannot change roles for user outside your organisation'
    );
  }

  // Check if user exists in Auth0
  const auth0Client = getAuth0ManagementClient();
  const auth0User = await auth0Service.getUserByEmail(auth0Client, user.Email);

  let newRoles;
  if (auth0User) {
    // Update user in Auth0
    newRoles = await updateOrgUserRoles(
      auth0Client,
      sessionData.orgKey,
      auth0User.user_id,
      body.input.roleIds
    );
  } else {
    const allRoles = await auth0Service.getRoles(auth0Client);
    newRoles = allRoles.filter((role) => body.input.roleIds.includes(role.id));
  }

  // Update Hasura user with new roles
  const defaultRole = auth0Service.getDefaultRole(
    newRoles?.map((role) => role.name) || []
  );
  await updateUser(hasuraClient, {
    Id: user.Id,
    OrgKey: sessionData.orgKey,
    RoleKey: defaultRole,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      roles: newRoles,
    }),
  };
}
