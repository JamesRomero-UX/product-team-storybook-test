import type { Logger } from '@aws-lambda-powertools/logger';
import type { ObjectDeleted } from '@risksmart-app/events/src/types/orguser-events';

import type { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import type { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import { PermissionsOperation } from '../../types';

export interface ObjectDeletedPermissionsDependencies {
  emitPermissionsUpdatedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdatedEvent'];
  emitPermissionsUpdateFailedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdateFailedEvent'];
  processGenericPermitResource: ReturnType<
    typeof createGenericPermitResourceProcessor
  >;
  logger: Logger;
}

/**
 * ObjectDeleted Permissions Handler
 *
 * This handler processes object deletion events and removes permissions
 * from Permit.io (our authorization service).
 *
 * ## What it does:
 * 1. Receives an object deletion event with objectId and objectType
 * 2. Removes the resource instance from Permit.io
 * 3. Emits success/failure events for downstream consumers
 *
 * ## Cascading Behavior:
 * When an object is deleted from Permit.io:
 * - All role assignments for that object are automatically removed
 *   i.e. owners, contributors, owner groups, contributor groups (Permit.io handles cascade)
 * - Parent-child relationships involving this object are cleaned up (Permit.io handles cleanup)
 * - Child objects do NOT inherit this deletion - they remain but lose
 *   the permission inheritance link from the deleted parent
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */
export const createObjectDeletedPermissionsHandler =
  (deps: ObjectDeletedPermissionsDependencies) =>
  async (event: ObjectDeleted): Promise<void> => {
    const { objectId, objectType } = event.data;
    const { tenant, orgKey, userId } = event.metadata;
    const {
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      processGenericPermitResource,
      logger,
    } = deps;

    logger.appendKeys({
      objectId,
      objectType,
      tenant,
      orgKey,
      userId,
    });
    logger.info('Processing ObjectDeleted permissions');

    try {
      await processGenericPermitResource({
        op: PermissionsOperation.Delete,
        orgKey: orgKey,
        id: objectId,
        objectType: objectType,
      });

      logger.info('Successfully deleted permissions');

      await emitPermissionsUpdatedEvent(event.metadata, {
        objectType,
        objectId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        objectType,
        objectId,
        error: errorMessage,
      });

      throw error;
    }
  };
