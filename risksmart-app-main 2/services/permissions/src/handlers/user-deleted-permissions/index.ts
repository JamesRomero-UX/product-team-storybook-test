import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { createUserChangesProcessor } from '../../adaptors/permit/process-user-changes';
import { createTenantPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createUserDeletedPermissionsHandler } from './user-deleted-permissions-handler';

export interface CreateUserDeletedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createUserDeletedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateUserDeletedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createTenantPermissionsEventEmitters(eventBridge, logger);

  return createUserDeletedPermissionsHandler({
    processUserChanges: createUserChangesProcessor({
      logger,
      tryCreateUser: permitDeps.permitRsSDK.tryCreateUser,
      tryDeleteUser: permitDeps.permitRsSDK.tryDeleteUser,
    }),
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
    logger,
  });
};
