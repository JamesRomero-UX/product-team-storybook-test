import type { Logger } from '@aws-lambda-powertools/logger';
import type { UserCreated } from '@risksmart-app/events/src/types/tenant-events';

import type { createUserChangesProcessor } from '../../adaptors/permit/process-user-changes';
import type { createTenantPermissionsEventEmitters } from '../../events/producers';
import { PermissionsOperation } from '../../types';

export interface UserCreatedPermissionsDependencies {
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
 * UserCreated Permissions Handler
 *
 * Processes UserCreated events and registers the new user in Permit.io.
 *
 * ## What it does:
 * 1. Creates a Permit.io user (idempotent — silently succeeds if already exists)
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */
export const createUserCreatedPermissionsHandler =
  (deps: UserCreatedPermissionsDependencies) =>
  async (event: UserCreated): Promise<void> => {
    const { userId } = event.data;
    const { tenant } = event.metadata;
    const {
      processUserChanges,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      logger,
    } = deps;

    logger.appendKeys({ userId, tenant });
    logger.info('Processing UserCreated permissions');

    try {
      await processUserChanges({ op: PermissionsOperation.Insert, userId });

      logger.info('Successfully created permissions');

      await emitPermissionsUpdatedEvent(event.metadata, { userId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        userId,
        error: errorMessage,
      });
      throw error;
    }
  };
