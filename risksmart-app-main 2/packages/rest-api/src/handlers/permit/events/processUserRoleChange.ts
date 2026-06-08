import type { PermitSDK } from '@risksmart-app/permitio/types';
import { ROOT_RESOURCE_ID, RS_NODE_ID } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';

import { getLogger } from '../../../logger';
import { getRoleById } from '../../../services/role/roleService';
import { getUserById } from '../../../services/user/userService';
import { pollForResourceInstance } from './utils';

const logger = getLogger();

export async function processUserRoleChange(
  permit: Permit,
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    RoleKey?: string | undefined;
    UserId?: string | undefined;
  },
  tenant: string
): Promise<void> {
  const { OP, UserId, RoleKey, OrgKey } = config;

  logger.info('Processing user role change', {
    operation: OP,
    userId: UserId,
    roleKey: RoleKey,
    orgKey: OrgKey,
  });

  if (!UserId || !RoleKey || !OrgKey) {
    logger.warn('Missing required fields for user role change', {
      userId: UserId,
      roleKey: RoleKey,
      orgKey: OrgKey,
    });

    return;
  }

  // Check if user exists in permit
  const userExists = await permitRsSDK.userExists(UserId);
  if (!userExists) {
    logger.warn('User does not exist in permit, skipping role assignment', {
      userId: UserId,
    });

    return;
  }
  logger.info('User exists in permit, proceeding with role assignment', {
    userId: UserId,
  });

  // Get Hasura client
  const hasuraClient = getHasuraAdminClient(tenant);

  // Get role information
  const role = await getRoleById(hasuraClient, RoleKey);
  if (!role) {
    logger.warn('Role not found in database', { roleKey: RoleKey });

    return;
  }
  logger.info('Role found in database, proceeding with role assignment', {
    roleKey: RoleKey,
  });

  // Get user information for email
  const user = await getUserById(hasuraClient, UserId);
  if (!user || !user.Email) {
    logger.warn('User not found in database or missing email', {
      userId: UserId,
    });

    return;
  }

  const { InstanceRoleKey, TopLevelRoleKey, resourceTypes } = role;

  logger.info('Processing role assignment', {
    operation: OP,
    userId: UserId,
    userEmail: user.Email,
    roleKey: RoleKey,
    permitInstanceRoleKey: InstanceRoleKey,
    permitTopLevelRoleKey: TopLevelRoleKey,
    resourceTypes: resourceTypes,
  });

  try {
    if (OP === 'INSERT') {
      // Check if resource roleKey exists before doing any role assignments
      if (InstanceRoleKey) {
        for (const resourceType of resourceTypes) {
          const resourceInstanceKey = ROOT_RESOURCE_ID(
            resourceType.ResourceType,
            OrgKey
          );
          logger.info(
            'Checking if resource roleKey exists before role assignment',
            {
              resourceType: 'rs_node',
              instanceKey: resourceInstanceKey,
              orgKey: OrgKey,
            }
          );

          const resourceExists = await pollForResourceInstance(
            logger,
            permitRsSDK,
            'rs_node',
            resourceInstanceKey,
            OrgKey,
            1
          );

          if (!resourceExists) {
            const errorMessage = `Resource instance '${resourceInstanceKey}' of type 'rs_node' does not exist in tenant '${OrgKey}'. Cannot assign role without existing resource instance.`;

            logger.error(
              'Resource instance does not exist for role assignment',
              {
                resourceType: 'rs_node',
                instanceKey: resourceInstanceKey,
                orgKey: OrgKey,
                userId: UserId,
                roleKey: RoleKey,
              }
            );

            throw new Error(errorMessage);
          }

          logger.info(
            'Resource instance exists, proceeding with role assignment'
          );
        }
      }

      // Handle top-level role assignment if TopLevelRoleKey is provided
      if (TopLevelRoleKey) {
        logger.info('Processing top-level role assignment', {
          permitTopLevelRoleKey: TopLevelRoleKey,
          userId: UserId,
        });

        const shouldAssignTopLevelRole = await checkIfRoleExists(
          permit,
          TopLevelRoleKey,
          { userId: UserId, roleKey: RoleKey }
        );

        if (shouldAssignTopLevelRole) {
          await assignTopLevelRole(permit, {
            role: TopLevelRoleKey,
            tenant: OrgKey,
            user: user.Id,
            userId: UserId,
            roleKey: RoleKey,
          });
        }
      }

      // Handle instance role assignment if InstanceRoleKey is provided
      if (InstanceRoleKey) {
        logger.info('Processing instance role assignment', {
          permitInstanceRoleKey: InstanceRoleKey,
          resourceTypes,
          userId: UserId,
        });

        for (const resourceType of resourceTypes) {
          const resourceInstance = RS_NODE_ID(
            ROOT_RESOURCE_ID(resourceType.ResourceType, OrgKey)
          );
          logger.info('Assigning instance role', {
            permitInstanceRoleKey: InstanceRoleKey,
            resourceInstance,
            userId: UserId,
          });
          await assignInstanceRole(permit, {
            role: InstanceRoleKey,
            resourceInstance,
            tenant: OrgKey,
            user: user.Id,
            userId: UserId,
            roleKey: RoleKey,
          });
        }
      }

      if (!TopLevelRoleKey && !InstanceRoleKey) {
        logger.info('No role keys provided, skipping role assignment', {
          userId: UserId,
          roleKey: RoleKey,
        });
      }
    } else if (OP === 'DELETE') {
      // Handle top-level role removal if TopLevelRoleKey is provided
      if (TopLevelRoleKey) {
        logger.info('Removing top-level role assignment', {
          permitTopLevelRoleKey: TopLevelRoleKey,
          userId: UserId,
        });

        try {
          await permit.api.roleAssignments.unassign({
            role: TopLevelRoleKey,
            tenant: OrgKey,
            user: user.Id,
          });

          logger.info('Successfully unassigned top-level role', {
            userId: UserId,
            roleKey: RoleKey,
            permitTopLevelRoleKey: TopLevelRoleKey,
          });
        } catch (error) {
          logger.warn('Failed to unassign top-level role', {
            userId: UserId,
            roleKey: RoleKey,
            permitTopLevelRoleKey: TopLevelRoleKey,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Handle instance role removal if InstanceRoleKey is provided
      if (InstanceRoleKey) {
        logger.info('Removing instance role assignment', {
          permitInstanceRoleKey: InstanceRoleKey,
          resourceTypes,
          userId: UserId,
        });
        for (const resourceType of resourceTypes) {
          const resourceInstanceWithType = RS_NODE_ID(
            ROOT_RESOURCE_ID(resourceType.ResourceType, OrgKey)
          );
          logger.info('Unassigning instance role', {
            permitInstanceRoleKey: InstanceRoleKey,
            resourceInstanceWithType,
            userId: UserId,
          });

          try {
            await permit.api.roleAssignments.unassign({
              role: InstanceRoleKey,
              resource_instance: resourceInstanceWithType,
              tenant: OrgKey,
              user: user.Id,
            });

            logger.info('Successfully unassigned instance role', {
              userId: UserId,
              roleKey: RoleKey,
              resourceInstanceWithType,
            });
          } catch (error) {
            logger.warn('Failed to unassign instance role', {
              userId: UserId,
              roleKey: RoleKey,
              permitInstanceRoleKey: InstanceRoleKey,
              resourceInstanceWithType,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } else {
      logger.info('No action needed for UPDATE operation');
    }
  } catch (error) {
    logger.error('Error processing role assignment', {
      error,
      operation: OP,
      userId: UserId,
      roleKey: RoleKey,
      hasInstanceRole: !!InstanceRoleKey,
      hasTopLevelRole: !!TopLevelRoleKey,
      resourceInstance: InstanceRoleKey ? resourceTypes : undefined,
    });
    throw error;
  }

  logger.info('Role change processing complete', {
    operation: OP,
    userId: UserId,
    roleKey: RoleKey,
    orgKey: OrgKey,
    processedInstanceRole: !!InstanceRoleKey,
    processedTopLevelRole: !!TopLevelRoleKey,
    resourceInstance: InstanceRoleKey ? resourceTypes : undefined,
  });
}

// Helper function to check if a role exists in Permit
async function checkIfRoleExists(
  permit: Permit,
  roleKey: string,
  context: { userId: string; roleKey: string }
): Promise<boolean> {
  logger.info('Checking if top level role exists in Permit', {
    ...context,
    permitRoleKey: roleKey,
  });

  try {
    await permit.api.roles.get(roleKey);
    logger.info('Top level role exists in Permit', {
      ...context,
      permitRoleKey: roleKey,
    });

    return true;
  } catch (error) {
    logger.warn(
      'Top level role does not exist in Permit, will skip assignment',
      {
        ...context,
        permitRoleKey: roleKey,
        error: error instanceof Error ? error.message : String(error),
      }
    );

    return false;
  }
}

// Helper function to assign top level role
async function assignTopLevelRole(
  permit: Permit,
  params: {
    role: string;
    tenant: string;
    user: string;
    userId: string;
    roleKey: string;
  }
): Promise<void> {
  logger.info('Assigning top level role', {
    userId: params.userId,
    roleKey: params.roleKey,
    permitRoleKey: params.role,
  });

  await permit.api.roleAssignments.assign({
    role: params.role,
    tenant: params.tenant,
    user: params.user,
  });

  logger.info('Successfully assigned top level role', {
    userId: params.userId,
    roleKey: params.roleKey,
    permitRoleKey: params.role,
  });
}

// Helper function to assign instance role
async function assignInstanceRole(
  permit: Permit,
  params: {
    role: string;
    resourceInstance: string;
    tenant: string;
    user: string;
    userId: string;
    roleKey: string;
  }
): Promise<void> {
  logger.info('Assigning instance role', {
    userId: params.userId,
    roleKey: params.roleKey,
    resourceInstance: params.resourceInstance,
  });

  await permit.api.roleAssignments.assign({
    role: params.role,
    resource_instance: params.resourceInstance,
    tenant: params.tenant,
    user: params.user,
  });

  logger.info('Successfully assigned instance role', {
    userId: params.userId,
    roleKey: params.roleKey,
    resourceInstance: params.resourceInstance,
  });
}
