import type { Logger } from '@aws-lambda-powertools/logger';
import type { UserGroupCreated } from '@risksmart-app/events/src/types/orguser-events';

import type { createUserGroupChangesProcessor } from '../../adaptors/permit/process-user-group-changes';
import type { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import { PermissionsOperation } from '../../types';

export interface UserGroupCreatedPermissionsDependencies {
  processUserGroupChanges: ReturnType<typeof createUserGroupChangesProcessor>;
  emitPermissionsUpdatedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdatedEvent'];
  emitPermissionsUpdateFailedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdateFailedEvent'];
  logger: Logger;
}

/**
 * UserGroupCreated Permissions Handler
 *
 * Processes UserGroupCreated events and registers the new user group in Permit.io.
 *
 * ## What it does:
 * 1. Creates a Permit.io user group (idempotent — silently succeeds if already exists)
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */
export const createUserGroupCreatedPermissionsHandler =
  (deps: UserGroupCreatedPermissionsDependencies) =>
  async (event: UserGroupCreated): Promise<void> => {
    const { groupId: userGroupId } = event.data;
    const { orgKey } = event.metadata;
    const {
      processUserGroupChanges,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      logger,
    } = deps;

    logger.appendKeys({ userGroupId, orgKey });
    logger.info('Processing UserGroupCreated permissions');

    try {
      await processUserGroupChanges({
        op: PermissionsOperation.Insert,
        userGroupId,
        orgKey,
      });

      logger.info('Successfully created user group permissions');

      await emitPermissionsUpdatedEvent(event.metadata, {
        groupId: userGroupId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create user group permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        groupId: userGroupId,
        error: errorMessage,
      });
      throw error;
    }
  };
