import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/src/types';

import { PermissionsOperation } from '../../types';
import type { UserGroupItem } from '../database/transform';
import {
  extractGroupIds,
  findIdsToRemove,
  getGroupResourceType,
  type GroupRelationType,
  mapToGroupRelationshipTupleCreateInputs,
  mapToGroupRelationshipTupleDeleteInputs,
} from './transform';

export interface ExistingGroupRelationship {
  subject: string;
  relation: string;
}

interface BaseGroupRelationshipChangeParams {
  desiredGroupsWithAccess?: UserGroupItem[];
  relationType: GroupRelationType;
  orgKey: string;
  objectId: string;
}

interface InsertGroupRelationshipChangeParams extends BaseGroupRelationshipChangeParams {
  op: PermissionsOperation.Insert;
}

interface UpdateGroupRelationshipChangeParams extends BaseGroupRelationshipChangeParams {
  op: PermissionsOperation.Update;
  existingGroupRelationships: ExistingGroupRelationship[];
}

export type ProcessGroupRelationshipChangesParams =
  | InsertGroupRelationshipChangeParams
  | UpdateGroupRelationshipChangeParams;

export interface CreateGroupRelationshipChangesProcessorProps {
  logger: Logger;
  tryCreateRelationshipTuple: PermitSDK['tryCreateRelationshipTuple'];
  tryDeleteRelationshipTuple: PermitSDK['tryDeleteRelationshipTuple'];
}

/**
 * Creates a processor for group relationship tuple changes (owner groups and contributor groups).
 *
 * This processor handles:
 * - INSERT: Creates relationship tuples for new groups
 * - UPDATE: Compares existing vs desired group relationships and syncs accordingly
 *
 * @example
 * const processGroupRelationshipChanges = createGroupRelationshipChangesProcessor({
 *   logger,
 *   tryCreateRelationshipTuple,
 *   tryDeleteRelationshipTuple
 * });
 * await processGroupRelationshipChanges({
 *   op: PermissionsOperation.Insert,
 *   desiredGroupsWithAccess: [{ userGroupId: 'group-1', ... }],
 *   relationType: 'owner',
 *   orgKey: 'org-key',
 *   objectId: 'object-id',
 * });
 */
export const createGroupRelationshipChangesProcessor =
  ({
    logger,
    tryCreateRelationshipTuple,
    tryDeleteRelationshipTuple,
  }: CreateGroupRelationshipChangesProcessorProps) =>
  async (params: ProcessGroupRelationshipChangesParams) => {
    const {
      op,
      desiredGroupsWithAccess = [],
      relationType,
      orgKey,
      objectId,
    } = params;
    logger.info('Processing group relationship changes', { op, relationType });

    const instanceKey = RS_NODE_ID(objectId);
    const resourceType = getGroupResourceType(relationType);

    // Handle UPDATE specific operations: remove stale group relationships
    if (op === PermissionsOperation.Update) {
      logger.info('Processing UPDATE operation for group relationships');

      const { existingGroupRelationships } = params;

      const currentGroupRelationships = existingGroupRelationships.filter(
        (r) => r.relation === relationType
      );

      const currentGroupsWithAccessToResourceInstance = extractGroupIds(
        currentGroupRelationships,
        resourceType
      );
      const desiredGroupsWithAccessToResourceInstance =
        desiredGroupsWithAccess.map((item) => item.userGroupId);
      const groupRelationshipsToRemove = findIdsToRemove(
        currentGroupsWithAccessToResourceInstance,
        desiredGroupsWithAccessToResourceInstance
      );

      if (groupRelationshipsToRemove.length > 0) {
        logger.info('Removing stale group relationships', {
          count: groupRelationshipsToRemove.length,
        });

        const deleteInputs = mapToGroupRelationshipTupleDeleteInputs(
          groupRelationshipsToRemove,
          instanceKey,
          relationType
        );

        await Promise.all(
          deleteInputs.map((input) => tryDeleteRelationshipTuple(input))
        );
        logger.info('Stale group relationships removed');
      }
    }

    // Skip relationship creation if no groups to add
    if (!desiredGroupsWithAccess.length) {
      return;
    }

    // Create group relationship tuples
    logger.info('Creating group relationship tuples', {
      count: desiredGroupsWithAccess.length,
      relationType,
    });

    const groupIds = desiredGroupsWithAccess.map((item) => item.userGroupId);
    const createInputs = mapToGroupRelationshipTupleCreateInputs(
      groupIds,
      instanceKey,
      relationType,
      orgKey
    );

    await Promise.all(
      createInputs.map((input) => tryCreateRelationshipTuple(input))
    );

    logger.info('Group relationship tuple creation complete');
  };
