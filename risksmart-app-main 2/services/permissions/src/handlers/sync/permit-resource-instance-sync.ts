import type { Logger } from '@aws-lambda-powertools/logger';
import { rootObjectTypes } from '@risksmart-app/permitio/src/types';

import { rootResourceInstanceId, rsNodeId } from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';

type NodeRetriever = (orgKey: string) => Promise<
  {
    Id: string;
    OrgKey: string;
    ObjectType: string;
  }[]
>;

type ResourceInstanceCreator = (
  input: {
    key: string;
    tenant: string;
    resource: string;
    attributes: {
      ObjectType: string;
    };
  }[]
) => Promise<void>;

type ResourceInstanceRemover = (keys: string[]) => Promise<void>;

interface Dependencies {
  nodeRetriever: NodeRetriever;
  resourceInstanceCreator: ResourceInstanceCreator;
  resourceInstanceRemover: ResourceInstanceRemover;
  orgKey: string;
  orgStats: OrgSyncStats;
  orgLogger: Logger;
  permitOrg: PermitTenant | undefined;
}

export const createResourceInstanceSyncHandler = (
  dependencies: Dependencies
) => {
  const syncExecutor = async () => {
    return await executeResourceInstanceSync(dependencies);
  };

  return {
    executeResourceInstanceSync: syncExecutor,
  };
};

export const executeResourceInstanceSync = async (input: Dependencies) => {
  const {
    nodeRetriever,
    resourceInstanceCreator,
    resourceInstanceRemover,
    orgKey,
    orgStats,
    orgLogger,
    permitOrg,
  } = input;
  const relationshipTuples: {
    object: string;
    relation: string;
    subject: string;
    tenant: string;
  }[] = [];
  orgLogger.info('Processing org resource instances', { orgKey });

  orgLogger.info('permit org resource instances', {
    existingResourceInstanceCount: permitOrg
      ? permitOrg.ResourceInstances.size
      : 0,
  });

  const nodes = await nodeRetriever(orgKey);
  orgLogger.info('Got nodes from DB', {
    nodeCount: nodes.length,
  });

  const resources = nodes.map((node) => ({
    key: node.Id,
    tenant: node.OrgKey,
    resource: 'rs_node',
    attributes: {
      ObjectType: node.ObjectType.toString(),
    },
  }));
  const tenantRootObjectTypeInstances = rootObjectTypes.map((objectType) => ({
    key: `${objectType}-${orgKey}`,
    tenant: orgKey,
    resource: 'rs_node',
    attributes: {
      ObjectType: objectType,
    },
  }));
  for (const tenantRootObjectTypeInstance of tenantRootObjectTypeInstances) {
    const type = tenantRootObjectTypeInstance.attributes['ObjectType'];
    for (const resource of resources) {
      if (resource.attributes['ObjectType'] === type) {
        relationshipTuples.push({
          object: rsNodeId(resource.key),
          relation: `rs_parent`,
          subject: rootResourceInstanceId(type, orgKey),
          tenant: orgKey,
        });
      }
    }
  }
  // Use concat instead of spread to avoid stack overflow with large arrays
  const allResources = resources.concat(tenantRootObjectTypeInstances);
  const resourceKeysSet = new Set(allResources.map((resource) => resource.key));

  const resourcesToCreate = allResources.filter((resource) =>
    permitOrg ? !permitOrg.ResourceInstances.has(rsNodeId(resource.key)) : true
  );

  // Only delete rs_node instances that are no longer in the DB.
  // user_group, owner_group, and contributor_group instances are managed
  // by the user group sync and must not be deleted here.
  const resourcesToDelete = Array.from(
    permitOrg ? permitOrg.ResourceInstances.entries() : []
  ).filter(
    ([_, resource]) =>
      !resourceKeysSet.has(resource.Id) && resource.InstanceType === 'rs_node'
  );

  if (resourcesToCreate.length === 0) {
    orgLogger.info('No resources to create.');
  } else {
    orgLogger.info('Bulk creating resource instances', {
      resourceCount: resourcesToCreate.length,
    });
    await resourceInstanceCreator(resourcesToCreate);
    orgLogger.info('Created resource instances');

    // Update sync stats for resource instances created
    orgStats.resourceInstancesCreated += resourcesToCreate.length;
  }

  // Delete resources immediately. Permit.io will cascade-delete their relationships.
  // Construct Set once for reuse by relationship and ownership sync
  const deletedResourceSet = new Set(
    resourcesToDelete.map((resource) => resource[0])
  );

  if (deletedResourceSet.size > 0) {
    orgLogger.info('Bulk deleting resource instances', {
      resourceCount: deletedResourceSet.size,
    });
    await resourceInstanceRemover(Array.from(deletedResourceSet));
    orgLogger.info('Deleted resource instances');

    // Update sync stats for resource instances deleted
    orgStats.resourceInstancesDeleted += deletedResourceSet.size;
  } else {
    orgLogger.info('No resources to delete');
  }

  // Return relationship tuples for creation and the Set of deleted resource IDs
  // The relationship and ownership sync will reuse this Set to avoid duplicate construction
  return {
    relationshipTuples,
    deletedResourceSet,
  };
};
