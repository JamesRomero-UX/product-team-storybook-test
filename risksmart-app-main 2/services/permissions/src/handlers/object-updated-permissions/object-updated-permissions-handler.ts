import type { Logger } from '@aws-lambda-powertools/logger';
import { RelationshipType } from '@risksmart-app/events/src/types/common';
import type { ObjectUpdated } from '@risksmart-app/events/src/types/orguser-events';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';

import type { DataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import {
  mapEnrichedUserGroupsToUserGroupItems,
  mapEnrichedUsersToUserItems,
} from '../../adaptors/database/transform';
import type { createGetExistingRelationships } from '../../adaptors/permit/get-existing-relationships';
import type { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import type { ProcessGroupRelationshipChangesParams } from '../../adaptors/permit/process-group-relationship-changes';
import type { ProcessUserRoleChangesParams } from '../../adaptors/permit/process-user-role-changes';
import type { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { ResourceChild, ResourceParent } from '../../types';
import { PermissionsOperation } from '../../types';

export interface ObjectUpdatedPermissionsDependencies {
  dataLayerClient: DataLayerApiClient;
  resourceInstanceExists: PermitSDK['resourceInstanceExists'];
  emitPermissionsUpdatedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdatedEvent'];
  emitPermissionsUpdateFailedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdateFailedEvent'];
  processGenericPermitResource: ReturnType<
    typeof createGenericPermitResourceProcessor
  >;
  processUserRoleChanges: (
    props: ProcessUserRoleChangesParams
  ) => Promise<void>;
  processGroupRelationshipChanges: (
    props: ProcessGroupRelationshipChangesParams
  ) => Promise<void>;
  getExistingRelationships: ReturnType<typeof createGetExistingRelationships>;
  logger: Logger;
}

/**
 * ObjectUpdated Permissions Handler
 *
 * This handler processes object update events and synchronizes permissions
 * to Permit.io (our authorization service).
 *
 * ## What it does:
 * 1. Receives a thin event with objectId and objectType
 * 2. Fetches the enriched node data from the Data Layer API (includes object details,
 *    parent/child relationships, and user assignments)
 * 3. Checks existing Permit.io connections and decides what needs creating/deleting
 * 4. Synchronizes parent-child relationships
 * 5. Synchronizes user roles (owners, contributors) and group memberships (owner groups, contributor groups)
 *
 * ## Permission Model:
 * - **Parents**: Objects that this object inherits permissions from
 * - **Children**: Objects that inherit permissions from this object
 * - **Owners**: Users with full control over the object
 * - **Owner Groups**: User groups with owner-level access
 * - **Contributors**: Users with edit access to the object
 * - **Contributor Groups**: User groups with contributor-level access
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */
export const createObjectUpdatedPermissionsHandler =
  (deps: ObjectUpdatedPermissionsDependencies) =>
  async (event: ObjectUpdated): Promise<void> => {
    const { objectId, objectType } = event.data;
    const { tenant, orgKey, userId } = event.metadata;
    const {
      dataLayerClient,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      processGenericPermitResource,
      processUserRoleChanges,
      processGroupRelationshipChanges,
      getExistingRelationships,
      resourceInstanceExists,
      logger,
    } = deps;

    logger.appendKeys({
      objectId,
      objectType,
      tenant,
      orgKey,
      userId,
    });
    logger.info('Processing ObjectUpdated permission');

    try {
      const enrichedNodes = await dataLayerClient.getEnrichedNodes(
        tenant,
        orgKey,
        userId,
        [objectId]
      );
      const enrichedNode = enrichedNodes[0];

      if (!enrichedNode) {
        logger.warn('Enriched node not found');

        return;
      }
      logger.info('Successfully retrieved enriched node');

      // Check if resource instance exists in Permit
      const resourceExists = await resourceInstanceExists(
        objectId,
        'rs_node',
        orgKey
      );

      if (!resourceExists) {
        logger.warn(
          'Resource instance not found in Permit, skipping update operation'
        );

        return;
      }

      // Extract desired parent-child relationships from enriched node
      const desiredParents: ResourceParent[] = enrichedNode.targetLinkedItems
        .filter(
          (item) => item.RelationshipType === RelationshipType.ParentChild
        )
        .map((item) => ({
          parentId: item.Source,
          parentType: 'rs_node',
        }));

      //TODO: discuss if there is a scenario where we can change the children of an object?
      const desiredChildren: ResourceChild[] = enrichedNode.sourceLinkedItems
        .filter(
          (item) => item.RelationshipType === RelationshipType.ParentChild
        )
        .map((item) => ({
          childId: item.Target,
          childType: 'rs_node',
        }));

      // Sync parent-child relationships
      await processGenericPermitResource({
        op: PermissionsOperation.Update,
        orgKey,
        id: objectId,
        objectType,
        parents: desiredParents,
        children: desiredChildren,
      });

      // Fetch current Permit state once here to avoid redundant API calls in processors
      logger.info('Fetching current Permit state for resource', { objectId });

      const {
        roleAssignments: existingRoleAssignments,
        groupRelationships: existingGroupRelationships,
      } = await getExistingRelationships({
        objectId,
        orgKey,
      });

      logger.info('Successfully fetched Permit state');

      // Sync user roles (owners, contributors) and group memberships (owner groups, contributor groups) to the object
      await Promise.all([
        processUserRoleChanges({
          op: PermissionsOperation.Update,
          desiredUsersForRole: mapEnrichedUsersToUserItems(enrichedNode.owners),
          role: 'Owner',
          orgKey,
          objectId,
          existingRoleAssignments,
        }),
        processUserRoleChanges({
          op: PermissionsOperation.Update,
          desiredUsersForRole: mapEnrichedUsersToUserItems(
            enrichedNode.contributors
          ),
          role: 'Contributor',
          orgKey,
          objectId,
          existingRoleAssignments,
        }),
        processGroupRelationshipChanges({
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: mapEnrichedUserGroupsToUserGroupItems(
            enrichedNode.ownerGroups
          ),
          relationType: 'owner',
          orgKey,
          objectId,
          existingGroupRelationships,
        }),
        processGroupRelationshipChanges({
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: mapEnrichedUserGroupsToUserGroupItems(
            enrichedNode.contributorGroups
          ),
          relationType: 'contributor',
          orgKey,
          objectId,
          existingGroupRelationships,
        }),
      ]);

      logger.info('Successfully updated permissions');

      await emitPermissionsUpdatedEvent(event.metadata, {
        objectType,
        objectId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        objectType,
        objectId,
        error: errorMessage,
      });
      throw error;
    }
  };
