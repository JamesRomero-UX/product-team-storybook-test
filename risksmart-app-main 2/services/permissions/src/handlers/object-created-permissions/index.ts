import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { dataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import { createGroupRelationshipChangesProcessor } from '../../adaptors/permit/process-group-relationship-changes';
import { createUserRoleChangesProcessor } from '../../adaptors/permit/process-user-role-changes';
import { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createObjectCreatedPermissionsHandler } from './object-created-permissions-handler';

export interface CreateObjectCreatedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createObjectCreatedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateObjectCreatedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createOrgUserPermissionsEventEmitters(eventBridge, logger);

  return createObjectCreatedPermissionsHandler({
    dataLayerClient: dataLayerApiClient,
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
    processUserRoleChanges: createUserRoleChangesProcessor({
      logger,
      tryAssignRole: permitDeps.permitRsSDK.tryAssignRole,
      tryUnassignRole: permitDeps.permitRsSDK.tryUnassignRole,
    }),
    processGroupRelationshipChanges: createGroupRelationshipChangesProcessor({
      logger,
      tryCreateRelationshipTuple:
        permitDeps.permitRsSDK.tryCreateRelationshipTuple,
      tryDeleteRelationshipTuple:
        permitDeps.permitRsSDK.tryDeleteRelationshipTuple,
    }),
    logger,
  });
};
