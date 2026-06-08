import type { Logger } from '@aws-lambda-powertools/logger';
import { RelationshipType } from '@risksmart-app/events/src/types/common';
import type { LinkedItemCreated } from '@risksmart-app/events/src/types/orguser-events';

import type { DataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import type { createAncestryRelationshipChangesProcessor } from '../../adaptors/permit/process-ancestry-relationship-changes';
import type { createOrgUserPermissionsEventEmitters } from '../../events/producers';
import type { ResourceChild, ResourceParent } from '../../types';
import { PermissionsOperation } from '../../types';

export interface LinkedItemCreatedPermissionsDependencies {
  dataLayerClient: DataLayerApiClient;
  emitPermissionsUpdatedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdatedEvent'];
  emitPermissionsUpdateFailedEvent: ReturnType<
    typeof createOrgUserPermissionsEventEmitters
  >['emitPermissionsUpdateFailedEvent'];
  processAncestryRelationshipChanges: ReturnType<
    typeof createAncestryRelationshipChangesProcessor
  >;
  logger: Logger;
}

/**
 * LinkedItemCreated Permissions Handler
 *
 * This handler processes LinkedItemCreated events and establishes
 * relationship tuples in Permit.io for permission inheritance.
 *
 * ## What it does:
 * 1. Skips sibling relationships (they don't affect permission inheritance)
 * 2. Fetches the source and target nodes from the Data Layer API and verifies they exist
 * 3. Creates a parent-child relationship tuple in Permit.io using the ancestry relationship changes processor
 *    - For ParentChild relationships: source is parent, target is child
 *    - For ChildParent relationships: source is child, target is parent
 *
 * ## Events:
 * - Emits `permissions-updated` on success
 * - Emits `permissions-update-failed` on failure
 */

export const createLinkedItemCreatedPermissionsHandler =
  (deps: LinkedItemCreatedPermissionsDependencies) =>
  async (event: LinkedItemCreated): Promise<void> => {
    const { linkedItemId, relationshipType, sourceId, targetId } = event.data;
    const { tenant, orgKey, userId } = event.metadata;
    const {
      dataLayerClient,
      emitPermissionsUpdatedEvent,
      emitPermissionsUpdateFailedEvent,
      processAncestryRelationshipChanges,
      logger,
    } = deps;

    logger.appendKeys({
      linkedItemId,
      relationshipType,
      sourceId,
      targetId,
      tenant,
      orgKey,
      userId,
    });

    logger.info('Processing LinkedItemCreated permissions');

    // Skip sibling relationships - they don't affect permission inheritance
    if (relationshipType === RelationshipType.Sibling) {
      logger.info('Skipping sibling relationship type for permissions', {
        relationshipType,
      });

      return;
    }

    try {
      // Check source and target nodes exist
      const [sourceNode, targetNode] = await Promise.all([
        dataLayerClient.getNode(tenant, orgKey, userId, sourceId),
        dataLayerClient.getNode(tenant, orgKey, userId, targetId),
      ]);

      if (!sourceNode || !targetNode) {
        logger.warn('Node not found', {
          sourceId,
          targetId,
          sourceFound: !!sourceNode,
          targetFound: !!targetNode,
        });

        return;
      }

      logger.info('Successfully retrieved both source and target nodes');

      const children: ResourceChild[] = [];
      const parents: ResourceParent[] = [];

      if (relationshipType === RelationshipType.ParentChild) {
        // source is parent, target is child
        children.push({
          childId: targetId,
          childType: 'rs_node',
        });
      } else {
        // ChildParent: source is child, target is parent
        parents.push({
          parentId: targetId,
          parentType: 'rs_node',
        });
      }

      logger.info('Creating permission relationship', {
        relationshipType,
        hasChildren: children.length > 0,
        hasParents: parents.length > 0,
      });

      // Create the relationship tuple in Permit
      await processAncestryRelationshipChanges({
        op: PermissionsOperation.Link,
        orgKey: orgKey,
        id: sourceId,
        objectType: 'rs_node',
        children,
        parents,
      });

      logger.info('Successfully created permissions');

      await emitPermissionsUpdatedEvent(event.metadata, {
        linkedItemId,
        relationshipType,
        sourceId,
        targetId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create permissions', { errorMessage });

      await emitPermissionsUpdateFailedEvent(event.metadata, {
        linkedItemId,
        relationshipType,
        sourceId,
        targetId,
        error: errorMessage,
      });
      throw error;
    }
  };
