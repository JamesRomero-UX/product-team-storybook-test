import type { Logger } from '@aws-lambda-powertools/logger';

import {
  buildResourceInstanceId,
  contributorGroupId,
  ownerGroupId,
  type ResourceInstanceId,
  rsNodeId,
} from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import { getRelationshipTupleKey } from './common';

type LinkedItemRetriever = (orgKey: string) => Promise<
  {
    Id: string;
    OrgKey: string;
    RelationshipType: string | null;
    source_node: {
      Id: string;
      OrgKey: string;
      ObjectType: string;
    } | null;
    target_node: {
      Id: string;
      OrgKey: string;
      ObjectType: string;
    } | null;
  }[]
>;

type OwnerGroupRetriever = (orgKey: string) => Promise<
  {
    OrgKey: string;
    UserGroupId: string;
    parentNode: {
      Id: string;
      OrgKey: string;
      ObjectType: string;
    } | null;
  }[]
>;

type ContributorGroupRetriever = (orgKey: string) => Promise<
  {
    OrgKey: string;
    UserGroupId: string;
    parentNode: {
      Id: string;
      OrgKey: string;
      ObjectType: string;
    } | null;
  }[]
>;

type RelationshipTupleCreator = (
  tuples: {
    object: string;
    relation: string;
    subject: string;
    tenant: string;
  }[]
) => Promise<void>;

type RelationshipTupleRemover = (
  tuples: {
    object: string;
    relation: string;
    subject: string;
  }[]
) => Promise<void>;

interface Dependencies {
  linkedItemRetriever: LinkedItemRetriever;
  ownerGroupRetriever: OwnerGroupRetriever;
  contributorGroupRetriever: ContributorGroupRetriever;
  relationshipTupleCreator: RelationshipTupleCreator;
  relationshipTupleRemover: RelationshipTupleRemover;
  orgKey: string;
  orgStats: OrgSyncStats;
  orgLogger: Logger;
  permitOrg: PermitTenant | undefined;
}

export const createRelationshipSyncHandler = (dependencies: Dependencies) => {
  const syncExecutor = async (
    relationshipTuples: {
      object: string;
      relation: string;
      subject: string;
      tenant: string;
    }[],
    deletedResourceSet: ReadonlySet<ResourceInstanceId>
  ) => {
    await executeRelationshipSync(
      dependencies,
      relationshipTuples,
      deletedResourceSet
    );
  };

  return {
    executeRelationshipSync: syncExecutor,
  };
};

export const executeRelationshipSync = async (
  input: Dependencies,
  relationshipTuples: {
    object: string;
    relation: string;
    subject: string;
    tenant: string;
  }[],
  deletedResourceSet: ReadonlySet<ResourceInstanceId>
) => {
  const {
    linkedItemRetriever,
    ownerGroupRetriever,
    contributorGroupRetriever,
    relationshipTupleCreator,
    relationshipTupleRemover,
    orgKey,
    orgStats,
    orgLogger,
    permitOrg,
  } = input;
  orgLogger.info('Processing org relationship tuples', {
    orgKey,
    permitOrgExists: !!permitOrg,
  });
  const links = await linkedItemRetriever(orgKey);
  orgLogger.info('Got linked items from DB', {
    linkCount: links.length,
  });

  // Filter for valid parent_child relationships only
  // - "child_parent" relationships are inverse references (used for reporting, not permissions)
  // - "sibling" relationships don't affect permission inheritance
  const filteredLinks = links.filter(
    (link) =>
      link.source_node &&
      link.target_node &&
      link.RelationshipType === 'parent_child'
  );

  orgLogger.info('Got filtered linked items from DB', {
    filteredLinkCount: filteredLinks.length,
  });

  const linkedItemRelationshipTuples = filteredLinks.map((link) => ({
    object: rsNodeId(link.target_node!.Id),
    relation: `rs_parent`,
    subject: rsNodeId(link.source_node!.Id),
    tenant: link.OrgKey,
  }));
  // Use concat instead of spread to avoid stack overflow with large arrays
  let allRelationshipTuples = relationshipTuples.concat(
    linkedItemRelationshipTuples
  );

  const ownerGroups = await ownerGroupRetriever(orgKey);

  orgLogger.info('Got owner groups from DB', {
    ownerGroupCount: ownerGroups.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  allRelationshipTuples = allRelationshipTuples.concat(
    ownerGroups.map((group) => ({
      object: rsNodeId(group.parentNode!.Id),
      relation: 'owner',
      subject: ownerGroupId(group.UserGroupId),
      tenant: group.OrgKey,
    }))
  );

  const contributorGroups = await contributorGroupRetriever(orgKey);
  orgLogger.info('Got contributor groups from DB', {
    contributorGroupCount: contributorGroups.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  allRelationshipTuples = allRelationshipTuples.concat(
    contributorGroups.map((group) => ({
      object: rsNodeId(group.parentNode!.Id),
      relation: 'contributor',
      subject: contributorGroupId(group.UserGroupId),
      tenant: orgKey,
    }))
  );

  const existingRelationshipTuples = Array.from(
    permitOrg ? permitOrg.ResourceInstances.entries() : []
  )
    .map(([_, ri]) =>
      ri.Relations.map((relation) => ({
        subject: relation.Subject,
        relation: relation.Relation,
        object: buildResourceInstanceId(ri.InstanceType, ri.Id),
      }))
    )
    .flat();

  orgLogger.info('Got existing relationship tuples from Permit', {
    existingRelationshipTupleCount: existingRelationshipTuples.length,
  });

  // Create a Set of tuple keys for O(1) lookups
  const existingTupleKeysSet = new Set(
    existingRelationshipTuples.map(getRelationshipTupleKey)
  );

  const relationshipTuplesToCreate = allRelationshipTuples.filter(
    (relationshipTuple) =>
      !existingTupleKeysSet.has(getRelationshipTupleKey(relationshipTuple))
  );

  orgLogger.info('Got relationship tuples to create', {
    relationshipTuplesToCreateCount: relationshipTuplesToCreate.length,
  });

  // Create a Set of desired tuple keys for O(1) lookups
  const desiredTupleKeysSet = new Set(
    allRelationshipTuples.map(getRelationshipTupleKey)
  );

  orgLogger.info('Logging desired tuple keys set', {
    desiredTupleKeysSetLength: desiredTupleKeysSet.size,
  });

  // Use the provided Set of deleted resource IDs for O(1) lookups
  // This Set was already constructed in resource instance sync to avoid duplicate work

  const relationshipTuplesToDelete = existingRelationshipTuples.filter(
    (relationshipTuple) =>
      !desiredTupleKeysSet.has(getRelationshipTupleKey(relationshipTuple)) &&
      relationshipTuple.subject.startsWith('rs_node:')
  );

  // Filter out relationships that reference deleted resources - Permit.io cascade-deletes them
  const normalRelationshipsToDelete = relationshipTuplesToDelete.filter(
    (tuple) =>
      !deletedResourceSet.has(tuple.object) &&
      !deletedResourceSet.has(tuple.subject)
  );

  const skippedCascadeDeleteCount =
    relationshipTuplesToDelete.length - normalRelationshipsToDelete.length;

  orgLogger.info('Got relationship tuples to delete', {
    relationshipTupleDeleteCount: relationshipTuplesToDelete.length,
    skippedDueToCascadeDelete: skippedCascadeDeleteCount,
    normalRelationshipsToDelete: normalRelationshipsToDelete.length,
  });

  if (relationshipTuplesToCreate.length === 0) {
    orgLogger.info('No relationship tuples to create.');
  } else {
    orgLogger.info('Creating relationship tuples.', {
      relationshipTupleCount: relationshipTuplesToCreate.length,
    });

    await relationshipTupleCreator(relationshipTuplesToCreate);
    orgLogger.info('Created relationship tuples.');

    // Update sync stats for relationship tuples created
    orgStats.relationshipTuplesCreated += relationshipTuplesToCreate.length;
  }

  // Skip deleting relationships that reference deleted resources
  // Permit.io handles cascading deletes automatically
  if (skippedCascadeDeleteCount > 0) {
    orgLogger.info(
      'Skipping deletion of relationship tuples that reference deleted resources (Permit.io will cascade-delete them)',
      {
        skippedCount: skippedCascadeDeleteCount,
      }
    );
  }

  // Delete stale relationships (not referencing deleted resources)
  if (normalRelationshipsToDelete.length > 0) {
    orgLogger.info('Deleting stale relationship tuples', {
      relationshipTupleCount: normalRelationshipsToDelete.length,
    });

    await relationshipTupleRemover(normalRelationshipsToDelete);
    orgLogger.info('Deleted stale relationship tuples');

    // Update sync stats for relationship tuples deleted
    orgStats.relationshipTuplesDeleted += normalRelationshipsToDelete.length;
  } else {
    orgLogger.info('No stale relationship tuples to delete');
  }
};
