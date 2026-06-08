import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createObjectDeletedPermissionsHandler } from './object-deleted-permissions-handler';

export interface CreateObjectDeletedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createObjectDeletedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateObjectDeletedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createOrgUserPermissionsEventEmitters(eventBridge, logger);

  return createObjectDeletedPermissionsHandler({
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
    processGenericPermitResource: createGenericPermitResourceProcessor({
      logger,
      tryCreateResourceInstance:
        permitDeps.permitRsSDK.tryCreateResourceInstance,
      tryDeleteResourceInstance:
        permitDeps.permitRsSDK.tryDeleteResourceInstance,
      tryCreateRelationshipTuple:
        permitDeps.permitRsSDK.tryCreateRelationshipTuple,
      tryDeleteRelationshipTuple:
        permitDeps.permitRsSDK.tryDeleteRelationshipTuple,
      listRelationshipTuples: permitDeps.permitRsSDK.listRelationshipTuples,
    }),
    logger,
  });
};
