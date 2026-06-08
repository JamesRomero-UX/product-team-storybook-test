import type { Logger } from '@aws-lambda-powertools/logger';
import { RelationshipType } from '@risksmart-app/events/src/types/common';
import type { ObjectCreated } from '@risksmart-app/events/src/types/orguser-events';

import type { DataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import {
  mapEnrichedUserGroupsToUserGroupItems,
  mapEnrichedUsersToUserItems,
} from '../../adaptors/database/transform';
import type { createGenericPermitResourceProcessor } from '../../adaptors/permit/process-generic-permit-resource';
import type { ProcessGroupRelationshipChangesParams } from '../../adaptors/permit/process-group-relationship-changes';
import type { ProcessUserRoleChangesParams } from '../../adaptors/permit/process-user-role-changes';
import type { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { ResourceChild, ResourceParent } from '../../types';
import { PermissionsOperation } from '../../types';

export interface ObjectCreatedPermissionsDependencies {
  dataLayerClient: DataLayerApiClient;
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
  logger: Logger;
}

/**
 * ObjectCreated Permissions Handler
 *
 * This handler processes object creation events and synchronizes permissions
 * to Permit.io (our authorization service).
 *
 * ## What it does:
 * 1. Fetches the enriched node data from the Data Layer API (includes object details,
 *    parent/child relationships, and user assignments)
 * 2. Registers the new object as a resource instance in Permit.io
 * 3. Establishes parent-child relationships for permission inheritance
 * 4. Assigns user roles (owners, contributors) and group memberships (owner groups, contributor groups) to the object
 *
 * ## Permission Model:
 * - **Parents**: Objects that this new object inherits permissions from
 *   (e.g., a Control inherits from its parent Risk)
 * - **Children**: Objects that will inherit permissions from this object
 * - **Owners**: Users with full control over the object
 * - **Owner Groups**: User groups with owner-level access
 * - **Contributors**: Users with edit access to the object
 * - **Contributor Groups**: User groups with contributor-level access
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */

export const createObjectCreatedPermissionsHandler =
  (deps: ObjectCreatedPermissionsDependencies) =>
  async (event: ObjectCreated): Promise<void> => {
    const { objectId, objectType } = event.data;
    const { tenant, orgKey, userId } = event.metadata;
    const {
      dataLayerClient,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      processGenericPermitResource,
      processUserRoleChanges,
      processGroupRelationshipChanges,
      logger,
    } = deps;

    logger.appendKeys({
      objectId,
      objectType,
      tenant,
      orgKey,
      userId,
    });

    logger.info('Processing ObjectCreated permissions');

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

      // Extract parent-child relationships for permission inheritance
      // We only process "parent_child" linked item relationships because:
      // - "child_parent" relationships are inverse references (used for reporting, not permissions)
      // - "sibling" relationships don't affect permission inheritance

      // Parents: resources this node inherits permissions FROM (current node is the child/target)
      const parents: ResourceParent[] = enrichedNode.targetLinkedItems
        .filter(
          (item) => item.RelationshipType === RelationshipType.ParentChild
        )
        .map((item) => ({
          parentId: item.Source,
          parentType: 'rs_node',
        }));

      // Children: resources that inherit permissions FROM this node (current node is the parent/source)
      const children: ResourceChild[] = enrichedNode.sourceLinkedItems
        .filter(
          (item) => item.RelationshipType === RelationshipType.ParentChild
        )
        .map((item) => ({
          childId: item.Target,
          childType: 'rs_node',
        }));

      // Register the object as a resource instance in Permit.io
      // This creates the object in the authorization system with its parent/child relationships
      await processGenericPermitResource({
        op: PermissionsOperation.Insert,
        orgKey: orgKey,
        id: objectId,
        objectType: objectType,
        parents: parents,
        children: children,
      });

      // Sync user roles (owners, contributors) and group memberships (owner groups, contributor groups) to the object
      await Promise.all([
        processUserRoleChanges({
          op: PermissionsOperation.Insert,
          desiredUsersForRole: mapEnrichedUsersToUserItems(enrichedNode.owners),
          role: 'Owner',
          orgKey,
          objectId,
        }),
        processUserRoleChanges({
          op: PermissionsOperation.Insert,
          desiredUsersForRole: mapEnrichedUsersToUserItems(
            enrichedNode.contributors
          ),
          role: 'Contributor',
          orgKey,
          objectId,
        }),
        processGroupRelationshipChanges({
          op: PermissionsOperation.Insert,
          desiredGroupsWithAccess: mapEnrichedUserGroupsToUserGroupItems(
            enrichedNode.ownerGroups
          ),
          relationType: 'owner',
          orgKey,
          objectId,
        }),
        processGroupRelationshipChanges({
          op: PermissionsOperation.Insert,
          desiredGroupsWithAccess: mapEnrichedUserGroupsToUserGroupItems(
            enrichedNode.contributorGroups
          ),
          relationType: 'contributor',
          orgKey,
          objectId,
        }),
      ]);

      logger.info('Successfully created permissions');

      await emitPermissionsUpdatedEvent(event.metadata, {
        objectType,
        objectId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        objectType,
        objectId,
        error: errorMessage,
      });
      throw error;
    }
  };
