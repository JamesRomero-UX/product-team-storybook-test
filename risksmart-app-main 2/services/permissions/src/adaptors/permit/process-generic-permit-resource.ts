import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import {
  isRootObjectType,
  ROOT_RESOURCE_ID,
  RS_NODE_ID,
} from '@risksmart-app/permitio/src/types';

import {
  PermissionsOperation,
  type ResourceChild,
  type ResourceParent,
} from '../../types';
import {
  extractChildIds,
  extractParentIds,
  findIdsToRemove,
  mapToChildRelationshipTupleCreateInputs,
  mapToChildRelationshipTupleDeleteInputs,
  mapToParentRelationshipTupleCreateInputs,
  mapToParentRelationshipTupleDeleteInputs,
  RS_PARENT_RELATION,
} from './transform';

export interface ProcessGenericPermitResourceParams {
  op:
    | PermissionsOperation.Insert
    | PermissionsOperation.Update
    | PermissionsOperation.Delete;
  orgKey: string;
  id: string;
  objectType: string;
  parents?: ResourceParent[];
  children?: ResourceChild[];
}

export interface CreateGenericPermitResourceProcessorProps {
  logger: Logger;
  tryCreateResourceInstance: PermitSDK['tryCreateResourceInstance'];
  tryDeleteResourceInstance: PermitSDK['tryDeleteResourceInstance'];
  tryCreateRelationshipTuple: PermitSDK['tryCreateRelationshipTuple'];
  tryDeleteRelationshipTuple: PermitSDK['tryDeleteRelationshipTuple'];
  listRelationshipTuples: PermitSDK['listRelationshipTuples'];
}

/**
 * Creates a processor for generic permit resource lifecycle management and parent-child relationships.
 *
 * This processor handles:
 * - INSERT: Creates a new resource instance and establishes parent/child relationships (including root relationships for root-level objects)
 * - UPDATE: Syncs parent and child relationships by removing stale relationships and adding new ones
 * - DELETE: Removes the resource instance (relationship tuples are automatically cleaned up by Permit)
 *
 * @example
 * const processGenericPermitResource = createGenericPermitResourceProcessor({
 *   logger,
 *   tryCreateResourceInstance,
 *   tryDeleteResourceInstance,
 *   tryCreateRelationshipTuple,
 *   tryDeleteRelationshipTuple,
 *   listRelationshipTuples
 * });
 * await processGenericPermitResource({
 *   op: PermissionsOperation.Insert,
 *   orgKey: 'org-key',
 *   id: 'resource-id',
 *   objectType: 'Risk',
 *   parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
 *   children: [{ childId: 'child-1', childType: 'rs_node' }],
 * });
 */
export const createGenericPermitResourceProcessor =
  ({
    logger,
    tryCreateResourceInstance,
    tryDeleteResourceInstance,
    tryCreateRelationshipTuple,
    tryDeleteRelationshipTuple,
    listRelationshipTuples,
  }: CreateGenericPermitResourceProcessorProps) =>
  async (params: ProcessGenericPermitResourceParams) => {
    const { op, orgKey, id, objectType, parents, children } = params;
    logger.info('Processing generic permit resource', { op });

    const instanceKey = RS_NODE_ID(id);

    // Handle DELETE optimistically (no existence check needed).
    // Permit cleans up relationship tuples automatically when a resource instance is deleted,
    // skipping explicit relationship deletions
    if (op === PermissionsOperation.Delete) {
      logger.info('Processing DELETE operation');

      logger.info('Attempting resource instance deletion');
      await tryDeleteResourceInstance({
        instanceKey,
      });
      logger.info('Resource instance deletion attempt complete');

      return;
    }

    // Handle INSERT specific operations optimistically (no existence check needed)
    if (op === PermissionsOperation.Insert) {
      logger.info('Processing INSERT operation');

      logger.info('Attempting resource instance creation');

      const wasCreated = await tryCreateResourceInstance({
        key: id,
        resource: 'rs_node',
        tenant: orgKey,
        attributes: {
          ObjectType: objectType,
        },
      });
      logger.info('Resource instance creation attempt complete');

      if (!wasCreated) {
        logger.info(
          'Resource instance already exists, skipping remaining INSERT operation'
        );

        return;
      }

      // Handle root level resource relationship tuple if needed
      if (isRootObjectType(objectType)) {
        const rootResource = RS_NODE_ID(ROOT_RESOURCE_ID(objectType, orgKey));

        logger.info('Attempting link to root resource instance', {
          rootResource,
          object: instanceKey,
          relation: RS_PARENT_RELATION,
        });

        await tryCreateRelationshipTuple({
          subject: rootResource,
          relation: RS_PARENT_RELATION,
          object: instanceKey,
          tenant: orgKey,
        });
        logger.info('Linking to root resource instance attempt complete');
      }
    }
    // Handle UPDATE specific operations optimistically (no existence check needed); skipping resource and root relationship creation
    else if (op === PermissionsOperation.Update) {
      logger.info('Processing UPDATE operation');

      logger.info(
        'Retrieving currently assigned parent and child relationships'
      );

      const [currentParentRelationships, currentChildRelationships] =
        await Promise.all([
          listRelationshipTuples({
            object: instanceKey,
            relation: RS_PARENT_RELATION,
            tenant: orgKey,
          }),
          listRelationshipTuples({
            subject: instanceKey,
            relation: RS_PARENT_RELATION,
            tenant: orgKey,
          }),
        ]);

      // Handle parent relationship deletions
      const currentParentIds = extractParentIds(currentParentRelationships);
      const desiredParentIds = (parents || []).map((p) => p.parentId);
      const parentsToRemove = findIdsToRemove(
        currentParentIds,
        desiredParentIds
      );

      // Remove stale parent relationships
      const parentDeleteInputs = mapToParentRelationshipTupleDeleteInputs(
        parentsToRemove,
        instanceKey
      );

      logger.info('Start parallel deletion of stale parent relationships');

      await Promise.all(
        parentDeleteInputs.map((input) => tryDeleteRelationshipTuple(input))
      );
      logger.info('Parallel deletion of stale parent relationships complete');

      // Handle child relationship deletions
      const currentChildIds = extractChildIds(currentChildRelationships);
      const desiredChildIds = (children || []).map((c) => c.childId);
      const childrenToRemove = findIdsToRemove(
        currentChildIds,
        desiredChildIds
      );

      // Remove stale child relationships
      const childDeleteInputs = mapToChildRelationshipTupleDeleteInputs(
        childrenToRemove,
        instanceKey
      );

      logger.info('Start parallel deletion of stale child relationships');

      await Promise.all(
        childDeleteInputs.map((input) => tryDeleteRelationshipTuple(input))
      );
      logger.info('Parallel deletion of stale child relationships complete');
    }

    // INSERT/UPDATE specific operations complete, handle common relationships optimistically
    // Create parent linked item relationship tuples
    if (parents && parents.length > 0) {
      const parentCreateInputs = mapToParentRelationshipTupleCreateInputs(
        parents,
        instanceKey,
        orgKey
      );

      logger.info('Start parallel creation of parent relationships');

      await Promise.all(
        parentCreateInputs.map((input) => tryCreateRelationshipTuple(input))
      );
      logger.info('Parallel creation of parent relationships complete');
    }

    // Handle child linked item relationship tuples
    if (children && children.length > 0) {
      const childCreateInputs = mapToChildRelationshipTupleCreateInputs(
        children,
        instanceKey,
        orgKey
      );

      logger.info('Start parallel creation of child relationships');

      await Promise.all(
        childCreateInputs.map((input) => tryCreateRelationshipTuple(input))
      );
      logger.info('Parallel creation of child relationships complete');
    }

    return;
  };
