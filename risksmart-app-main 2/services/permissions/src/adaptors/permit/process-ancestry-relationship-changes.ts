import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/src/types';

import {
  PermissionsOperation,
  type ResourceChild,
  type ResourceParent,
} from '../../types';
import {
  mapToChildRelationshipTupleCreateInputs,
  mapToChildRelationshipTupleDeleteInputs,
  mapToParentRelationshipTupleCreateInputs,
  mapToParentRelationshipTupleDeleteInputs,
} from './transform';

export interface ProcessAncestryRelationshipChangesParams {
  op: PermissionsOperation.Link | PermissionsOperation.Unlink;
  orgKey: string;
  id: string;
  objectType: string;
  parents?: ResourceParent[];
  children?: ResourceChild[];
}

export interface CreateAncestryRelationshipChangesProcessorProps {
  logger: Logger;
  tryCreateRelationshipTuple: PermitSDK['tryCreateRelationshipTuple'];
  tryDeleteRelationshipTuple: PermitSDK['tryDeleteRelationshipTuple'];
}

/**
 * Creates a processor for ancestry relationship changes without affecting resource instance.
 *
 * This processor handles:
 * - LINK: Creates parent and child relationship tuples for existing resource
 * - UNLINK: Removes parent and child relationship tuples without deleting the resource instance
 *
 * @example
 * const processAncestryRelationshipChanges = createAncestryRelationshipChangesProcessor({
 *   logger,
 *   tryCreateRelationshipTuple,
 *   tryDeleteRelationshipTuple,
 * });
 * await processAncestryRelationshipChanges({
 *   op: PermissionsOperation.Link,
 *   orgKey: 'org-key',
 *   id: 'resource-id',
 *   objectType: 'Risk',
 *   parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
 *   children: [{ childId: 'child-1', childType: 'rs_node' }],
 * });
 */
export const createAncestryRelationshipChangesProcessor =
  ({
    logger,
    tryCreateRelationshipTuple,
    tryDeleteRelationshipTuple,
  }: CreateAncestryRelationshipChangesProcessorProps) =>
  async (params: ProcessAncestryRelationshipChangesParams) => {
    const { op, orgKey, id, parents, children } = params;
    logger.info('Processing ancestry relationship changes', { op });

    const instanceKey = RS_NODE_ID(id);

    // Handle UNLINK - delete relationship tuples without deleting the resource
    if (op === PermissionsOperation.Unlink) {
      logger.info('Processing UNLINK operation');

      // Delete child relationship tuples
      if (children && children.length > 0) {
        const childDeleteInputs = mapToChildRelationshipTupleDeleteInputs(
          children.map((c) => c.childId),
          instanceKey
        );

        logger.info('Start parallel deletion of child relationships');

        await Promise.all(
          childDeleteInputs.map((input) => tryDeleteRelationshipTuple(input))
        );
        logger.info('Parallel deletion of child relationships complete');
      }

      // Delete parent relationship tuples
      if (parents && parents.length > 0) {
        const parentDeleteInputs = mapToParentRelationshipTupleDeleteInputs(
          parents.map((p) => p.parentId),
          instanceKey
        );

        logger.info('Start parallel deletion of parent relationships');

        await Promise.all(
          parentDeleteInputs.map((input) => tryDeleteRelationshipTuple(input))
        );
        logger.info('Parallel deletion of parent relationships complete');
      }

      return;
    }

    // Handle LINK - create relationship tuples without creating the resource
    if (op === PermissionsOperation.Link) {
      logger.info('Processing LINK operation');

      // Create parent relationship tuples
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

      // Create child relationship tuples
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
    }
  };
