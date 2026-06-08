import type { PermitSDK } from '@risksmart-app/permitio/types';
import {
  isRootObjectType,
  ROOT_RESOURCE_ID,
  RS_NODE_ID,
} from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';

import { getLogger } from '../../../logger';
import { pollForResourceInstance } from './utils';
const logger = getLogger();

export const processGenericPermitEntity = async (
  permit: Permit,
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    Id: string;
    EntityType?: string | undefined;
    Parents?: {
      ParentId: string;
      ParentType: string;
    }[];
  }
) => {
  logger.info('Processing generic permit entity', {
    config,
  });
  const instanceKey = RS_NODE_ID(config.Id);
  logger.appendKeys({
    instanceKey,
    orgKey: config.OrgKey,
  });
  if (config.OP === 'DELETE') {
    logger.info('Deleting resource');
    await permit.api.resourceInstances.delete(instanceKey);

    return;
  }

  if (config.EntityType === undefined) {
    logger.warn('No EntityType provided, skipping resource creation');

    return;
  }

  logger.info('Checking if resource instance exists', {
    instanceKey,
    orgKey: config.OrgKey,
  });

  const resourceExists = await pollForResourceInstance(
    logger,
    permitRsSDK,
    'rs_node',
    config.Id,
    config.OrgKey!,
    1
  );

  if (resourceExists) {
    logger.info('Found existing resources');
  } else {
    logger.info('Resource does not exist, creating resource');
    const createdResource = await permit.api.resourceInstances.create({
      key: config.Id,
      resource: 'rs_node',
      tenant: config.OrgKey,
      attributes: {
        ObjectType: config.EntityType,
      },
    });

    logger.info('Created resource', {
      resourceId: createdResource.resource_id,
    });

    // Link root level resource if needed
    if (isRootObjectType(config.EntityType)) {
      logger.info('Linking entity to root resource instance', {
        resourceId: createdResource.resource_id,
      });
      await permit.api.relationshipTuples.create({
        subject: RS_NODE_ID(
          ROOT_RESOURCE_ID(config.EntityType, config.OrgKey!)
        ),
        relation: `rs_parent`,
        object: instanceKey,
        tenant: config.OrgKey,
      });
    }
  }

  // Parents
  if (config.Parents && config.Parents.length > 0) {
    for (const parent of config.Parents) {
      logger.info('Entity has parent, assigning relationship tuples.', {
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
