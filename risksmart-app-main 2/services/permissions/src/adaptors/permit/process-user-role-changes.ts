import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/src/types';

import { PermissionsOperation } from '../../types';
import type { UserItem } from '../database/transform';
import {
  findIdsToRemove,
  mapToRoleAssignmentInputs,
  mapToRoleUnassignmentInputs,
  type RoleType,
} from './transform';

export interface ExistingRoleAssignment {
  user: string;
  role: string;
}

interface BaseUserRoleChangeParams {
  desiredUsersForRole?: UserItem[];
  role: RoleType;
  orgKey: string;
  objectId: string;
}

interface InsertUserRoleChangeParams extends BaseUserRoleChangeParams {
  op: PermissionsOperation.Insert;
}

interface UpdateUserRoleChangeParams extends BaseUserRoleChangeParams {
  op: PermissionsOperation.Update;
  existingRoleAssignments: ExistingRoleAssignment[];
}

export type ProcessUserRoleChangesParams =
  | InsertUserRoleChangeParams
  | UpdateUserRoleChangeParams;

export interface CreateUserRoleChangesProcessorProps {
  logger: Logger;
  tryAssignRole: PermitSDK['tryAssignRole'];
  tryUnassignRole: PermitSDK['tryUnassignRole'];
}

/**
 * Creates a processor for user role assignment changes (owners and contributors).
 *
 * This processor handles:
 * - INSERT: Assigns roles to new users
 * - UPDATE: Compares existing vs desired role assignments and syncs accordingly
 *
 * @example
 * const processUserRoleChanges = createUserRoleChangesProcessor({ logger, tryAssignRole, tryUnassignRole });
 * await processUserRoleChanges({
 *   op: PermissionsOperation.Insert,
 *   desiredUsersForRole: [{ userId: 'user-1', ... }],
 *   role: 'Owner',
 *   orgKey: 'org-key',
 *   objectId: 'object-id',
 * });
 */
export const createUserRoleChangesProcessor =
  ({
    logger,
    tryAssignRole,
    tryUnassignRole,
  }: CreateUserRoleChangesProcessorProps) =>
  async (params: ProcessUserRoleChangesParams) => {
    const { op, desiredUsersForRole = [], role, orgKey, objectId } = params;
    logger.info('Processing user role changes', { op, role });

    const instanceKey = RS_NODE_ID(objectId);

    // Handle UPDATE specific operations: remove stale role assignments
    if (op === PermissionsOperation.Update) {
      logger.info('Processing UPDATE operation for user roles');

      const { existingRoleAssignments } = params;

      //TODO: remove this kind of mapping as redundant?
      const desiredUsersToBeAssignedToRole = desiredUsersForRole.map(
        (item) => item.userId
      );

      const currentRoleAssignments = existingRoleAssignments.filter(
        (a) => a.role === role
      );

      const currentlyAssignedUsersToRole = currentRoleAssignments.map(
        (a) => a.user
      );
      const usersToUnassignFromRole = findIdsToRemove(
        currentlyAssignedUsersToRole,
        desiredUsersToBeAssignedToRole
      );

      if (usersToUnassignFromRole.length > 0) {
        logger.info('Removing stale role assignments', {
          count: usersToUnassignFromRole.length,
        });

        const unassignInputs = mapToRoleUnassignmentInputs(
          usersToUnassignFromRole,
          instanceKey,
          role,
          orgKey
        );

        await Promise.all(
          unassignInputs.map((input) => tryUnassignRole(input))
        );
        logger.info('Stale role assignments removed');
      }
    }

    // Skip role assignment if no users to add
    if (!desiredUsersForRole.length) {
      return;
    }

    // Assign roles to users
    logger.info('Assigning roles to users', {
      count: desiredUsersForRole.length,
      role,
    });

    const userIds = desiredUsersForRole.map((item) => item.userId);
    const assignInputs = mapToRoleAssignmentInputs(
      userIds,
      instanceKey,
      role,
      orgKey
    );

    await Promise.all(assignInputs.map((input) => tryAssignRole(input)));

    logger.info('User role assignments complete');
  };
