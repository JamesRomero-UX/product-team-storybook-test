import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { createUserChangesProcessor } from '../../adaptors/permit/process-user-changes';
import { createTenantPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createUserCreatedPermissionsHandler } from './user-created-permissions-handler';

export interface CreateUserCreatedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createUserCreatedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateUserCreatedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createTenantPermissionsEventEmitters(eventBridge, logger);

  return createUserCreatedPermissionsHandler({
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
