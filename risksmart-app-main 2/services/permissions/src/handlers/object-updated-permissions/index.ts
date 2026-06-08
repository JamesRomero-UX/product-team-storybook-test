import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { dataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import { createGetExistingRelationships } from '../../adaptors/permit/get-existing-relationships';
import { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import { createGroupRelationshipChangesProcessor } from '../../adaptors/permit/process-group-relationship-changes';
import { createUserRoleChangesProcessor } from '../../adaptors/permit/process-user-role-changes';
import { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { PermitDependencies } from '../../types';
import { createObjectUpdatedPermissionsHandler } from './object-updated-permissions-handler';

export interface CreateObjectUpdatedPermissionsProps {
  eventBridge: EventBridgeClient;
  logger: Logger;
  permitDeps: PermitDependencies;
}

export const createObjectUpdatedPermissions = ({
  eventBridge,
  logger,
  permitDeps,
}: CreateObjectUpdatedPermissionsProps) => {
  const { emitPermissionsUpdatedEvent, emitPermissionsUpdateFailedEvent } =
    createOrgUserPermissionsEventEmitters(eventBridge, logger);

  return createObjectUpdatedPermissionsHandler({
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
    getExistingRelationships: createGetExistingRelationships({
      listRoleAssignments: permitDeps.permitRsSDK.listRoleAssignments,
      listRelationshipTuples: permitDeps.permitRsSDK.listRelationshipTuples,
    }),
    resourceInstanceExists: permitDeps.permitRsSDK.resourceInstanceExists,
    logger,
  });
};
