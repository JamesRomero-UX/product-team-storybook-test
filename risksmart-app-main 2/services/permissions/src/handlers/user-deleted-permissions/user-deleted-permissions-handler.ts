import type { Logger } from '@aws-lambda-powertools/logger';
import type { UserDeleted } from '@risksmart-app/events/src/types/tenant-events';

import type { createUserChangesProcessor } from '../../adaptors/permit/process-user-changes';
import type { createTenantPermissionsEventEmitters } from '../../events/producers';
import { PermissionsOperation } from '../../types';

export interface UserDeletedPermissionsDependencies {
  processUserChanges: ReturnType<typeof createUserChangesProcessor>;
  emitPermissionsUpdatedEvent: ReturnType<
    typeof createTenantPermissionsEventEmitters
  >['emitPermissionsUpdatedEvent'];
  emitPermissionsUpdateFailedEvent: ReturnType<
    typeof createTenantPermissionsEventEmitters
  >['emitPermissionsUpdateFailedEvent'];
  logger: Logger;
}

/**
 * UserDeleted Permissions Handler
 *
 * Processes UserDeleted events and removes the user from Permit.io.
 *
 * ## What it does:
 * 1. Deletes a Permit.io user (idempotent — silently succeeds if already absent)
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */
export const createUserDeletedPermissionsHandler =
  (deps: UserDeletedPermissionsDependencies) =>
  async (event: UserDeleted): Promise<void> => {
    const { userId } = event.data;
    const { tenant } = event.metadata;
    const {
      processUserChanges,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      logger,
    } = deps;

    logger.appendKeys({ userId, tenant });
    logger.info('Processing UserDeleted permissions');

    try {
      await processUserChanges({ op: PermissionsOperation.Delete, userId });

      logger.info('Successfully deleted permissions');

      await emitPermissionsUpdatedEvent(event.metadata, { userId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        userId,
        error: errorMessage,
      });
      throw error;
    }
  };
