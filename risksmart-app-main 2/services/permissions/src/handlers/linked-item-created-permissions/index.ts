import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { dataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import { createAncestryRelationshipChangesProcessor } from '../../adaptors/permit/process-ancestry-relationship-changes';
import { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createLinkedItemCreatedPermissionsHandler } from './linked-item-created-permissions-handler';

export interface CreateLinkedItemCreatedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createLinkedItemCreatedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateLinkedItemCreatedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createOrgUserPermissionsEventEmitters(eventBridge, logger);

  return createLinkedItemCreatedPermissionsHandler({
    dataLayerClient: dataLayerApiClient,
    emitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent,
    processAncestryRelationshipChanges:
      createAncestryRelationshipChangesProcessor({
        logger,
        tryCreateRelationshipTuple:
          permitDeps.permitRsSDK.tryCreateRelationshipTuple,
        tryDeleteRelationshipTuple:
          permitDeps.permitRsSDK.tryDeleteRelationshipTuple,
      }),
    logger,
  });
};
