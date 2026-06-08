import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { createUserGroupChangesProcessor } from '../../adaptors/permit/process-user-group-changes';
import { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createUserGroupCreatedPermissionsHandler } from './user-group-created-permissions-handler';

export interface CreateUserGroupCreatedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createUserGroupCreatedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateUserGroupCreatedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createOrgUserPermissionsEventEmitters(eventBridge, logger);

  return createUserGroupCreatedPermissionsHandler({
    processUserGroupChanges: createUserGroupChangesProcessor({
      logger,
      tryCreateUserGroup: permitDeps.permitRsSDK.tryCreateUserGroup,
    }),
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
    logger,
  });
};
