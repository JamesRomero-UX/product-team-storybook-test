import type { PermitSDK } from '@risksmart-app/permitio/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';

import { getLogger } from '../../../logger';
import { pollForResourceInstance } from './utils';
const logger = getLogger();

export const processParentRelationEntity = async (
  permit: Permit,
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    Id: string;
    RelationshipType?: string | undefined;
    Parents?: {
      ParentId: string;
      ParentType: string;
    }[];
  }
) => {
  logger.info('Processing parent relation entity', {
    config,
  });
  const instanceKey = RS_NODE_ID(config.Id);
  logger.appendKeys({
    instanceKey,
    orgKey: config.OrgKey,
  });
  if (
    config.RelationshipType === undefined ||
    config.RelationshipType !== 'parent_child'
  ) {
    logger.warn(
      'No RelationshipType provided or RelationshipType is not parent_child, skipping relationship processing',
      {
        RelationshipType: config.RelationshipType,
      }
    );

    return;
  }

  if (config.OP === 'DELETE') {
    // If we are here, it means we are deleting an entity
    // Check if the resource instance exists
    // If the resource is deleted, wait in case of parent deletion
    await new Promise((resolve) => setTimeout(resolve, 3000));
    logger.info('Checking if resource instance exists', {
      instanceKey,
      orgKey: config.OrgKey,
    });
    const resourceExists = await pollForResourceInstance(
      logger,
      permitRsSDK,
      'rs_node',
      config.Id,
      config.OrgKey!
    );
    if (!resourceExists) {
      logger.info('Resource instance not found, skipping delete operation', {
        instanceKey,
        orgKey: config.OrgKey,
      });

      return;
    }
    logger.info('Resource instance found, ensuring relationship tuple exists', {
      instanceKey,
      orgKey: config.OrgKey,
    });

    logger.info('Deleting relationships');
    if (config.Parents && config.Parents.length > 0) {
      for (const parent of config.Parents) {
        logger.info('Checking for existing relationship tuples', {
          subject: RS_NODE_ID(parent.ParentId),
          relation: `rs_parent`,
          object: instanceKey,
        });
        const existingRelationshipTuples =
          await permit.api.relationshipTuples.list({
            subject: RS_NODE_ID(parent.ParentId),
            relation: `rs_parent`,
            object: instanceKey,
            tenant: config.OrgKey,
          });

        if (existingRelationshipTuples.length === 0) {
          logger.info('No relationship tuples found, skipping deletion', {
            subject: RS_NODE_ID(parent.ParentId),
            relation: `rs_parent`,
            object: instanceKey,
          });
          continue;
        }

        logger.info('Relationship tuple exists, deleting relationship tuples', {
          subject: instanceKey,
          relation: `rs_parent`,
        });

        logger.info('Entity has parent, removing relationship tuples.', {
          subject: RS_NODE_ID(parent.ParentId),
          relation: `rs_parent`,
          object: instanceKey,
        });
        await permit.api.relationshipTuples.delete({
          subject: RS_NODE_ID(parent.ParentId),
          relation: `rs_parent`,
          object: instanceKey,
        });
      }
    }
    logger.info('Deleted relationships');

    return;
  }

  // Poll until the resource instance is available
  const resourceExists = await pollForResourceInstance(
    logger,
    permitRsSDK,
    'rs_node',
    config.Id,
    config.OrgKey!
  );
  if (!resourceExists) {
    logger.error('Resource does not exist', {});
    throw new Error('Resource does not exist');
  }

  for (const parent of config.Parents ?? []) {
    logger.info('Getting parent instance', {
      resourceKey: parent.ParentId,
    });
    const parentExists = await pollForResourceInstance(
      logger,
      permitRsSDK,
      'rs_node',
      parent.ParentId,
      config.OrgKey!
    );
    if (!parentExists) {
      logger.error('Resource does not exist', {});
      throw new Error('Resource does not exist');
    }
  }

  // Parents
  if (config.Parents && config.Parents.length > 0) {
    for (const parent of config.Parents) {
      const existingAssignments = await permit.api.relationshipTuples.list({
        subject: `${parent.ParentType}:${parent.ParentId}`,
        relation: `rs_parent`,
        object: instanceKey,
        tenant: config.OrgKey,
      });
      if (existingAssignments.length > 0) {
        logger.info('Found existing relationship tuples', {
          existingAssignments,
        });
        continue;
      }
      logger.info('Assigning relationship tuples.', {
        subject: `${parent.ParentType}:${parent.ParentId}`,
        relation: `rs_parent`,
        object: instanceKey,
      });
      await permit.api.relationshipTuples.create({
        subject: `${parent.ParentType}:${parent.ParentId}`,
        relation: `rs_parent`,
        object: instanceKey,
        tenant: config.OrgKey,
      });
    }
  }

  return;
};
