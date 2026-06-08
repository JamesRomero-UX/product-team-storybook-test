import type { PermitSDK } from '@risksmart-app/permitio/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';

import { getLogger } from '../../../logger';
import { pollForResourceInstance } from './utils';
const logger = getLogger();

export const processUserEntityChange = async (
  permit: Permit,
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    Id: string;
    OwnerGroupId?: string | undefined;
    OwnerId?: string | undefined;
    ContributorGroupId?: string | undefined;
    ContributorId?: string | undefined;
  }
) => {
  logger.info('Processing user entity change to permit', {
    config,
  });
  const instanceKey = RS_NODE_ID(config.Id);
  logger.appendKeys({
    instanceKey,
    orgKey: config.OrgKey,
  });
  if (config.OP === 'UPDATE') {
    logger.info(
      'No action to take on update. Relationships should already be defined'
    );

    return;
  }

  if (config.OP === 'DELETE') {
    logger.info('Processing delete operation', {
      instanceKey,
      orgKey: config.OrgKey,
    });
    // If the resource is deleted, wait in case of parent deletion
    await new Promise((resolve) => setTimeout(resolve, 3000));
    logger.info('Checking if resource instance exists', {
      instanceKey,
      orgKey: config.OrgKey,
    });
    // Poll until the resource instance is available
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

    logger.info('Resource instance found, proceeding with delete operation', {
      instanceKey,
      orgKey: config.OrgKey,
    });

    if (config.OwnerId) {
      // Validate the user is currently assigned as an owner
      const roleAssignments = await permit.api.roleAssignments.list({
        resource_instance: instanceKey,
        tenant: config.OrgKey,
      });
      const isOwnerAssigned = roleAssignments.some(
        (assignment) =>
          assignment.role === 'Owner' && assignment.user === config.OwnerId
      );

      if (!isOwnerAssigned) {
        logger.info('No owner role assignment found, skipping removal', {
          user: config.OwnerId,
        });

        return;
      }

      logger.info('Removing owner role assignment', {
        user: config.OwnerId,
      });
      await permit.api.roleAssignments.unassign({
        resource_instance: instanceKey,
        role: 'Owner',
        tenant: config.OrgKey,
        user: config.OwnerId,
      });
      logger.info('Owner role assignment removed', {
        user: config.OwnerId,
      });

      return;
    }
    if (config.ContributorId) {
      // Validate the user is currently assigned as an contributor
      const roleAssignments = await permit.api.roleAssignments.list({
        resource_instance: instanceKey,
        tenant: config.OrgKey,
      });
      const isContributorAssigned = roleAssignments.some(
        (assignment) =>
          assignment.role === 'Contributor' &&
          assignment.user === config.ContributorId
      );

      if (!isContributorAssigned) {
        logger.info('No contributor role assignment found, skipping removal', {
          user: config.ContributorId,
        });

        return;
      }
      logger.info('Removing contributor role assignment', {
        user: config.ContributorId,
      });

      await permit.api.roleAssignments.unassign({
        resource_instance: instanceKey,
        role: 'Contributor',
        tenant: config.OrgKey,
        user: config.ContributorId,
      });
      logger.info('Contributor role assignment removed', {
        user: config.ContributorId,
      });

      return;
    }
    if (config.OwnerGroupId) {
      // Validate the group is currently assigned as an owner
      const relationshipTuples = await permit.api.relationshipTuples.list({
        subject: `owner_group:${config.OwnerGroupId}`,
        relation: 'owner',
        object: instanceKey,
        tenant: config.OrgKey,
      });
      const isOwnerGroupAssigned = relationshipTuples.length > 0;
      if (!isOwnerGroupAssigned) {
        logger.info(
          'No owner group relationship tuple found, skipping removal',
          {
            group: config.OwnerGroupId,
          }
        );

        return;
      }

      logger.info('Removing owner group relationship tuple', {
        group: config.OwnerGroupId,
      });
      await permit.api.relationshipTuples.delete({
        subject: `owner_group:${config.OwnerGroupId}`,
        relation: 'owner',
        object: instanceKey,
      });
      logger.info('Owner group relationship tuple removed', {
        group: config.OwnerGroupId,
      });

      return;
    }
    if (config.ContributorGroupId) {
      // Validate the group is currently assigned as an contributor
      const relationshipTuples = await permit.api.relationshipTuples.list({
        subject: `contributor_group:${config.ContributorGroupId}`,
        relation: 'contributor',
        object: instanceKey,
        tenant: config.OrgKey,
      });
      const isContributorGroupAssigned = relationshipTuples.length > 0;
      if (!isContributorGroupAssigned) {
        logger.info(
          'No contributor group relationship tuple found, skipping removal',
          {
            group: config.ContributorGroupId,
          }
        );

        return;
      }

      logger.info('Removing contributor group relationship tuple', {
        group: config.ContributorGroupId,
      });
      await permit.api.relationshipTuples.delete({
        subject: `contributor_group:${config.ContributorGroupId}`,
        relation: 'contributor',
        object: instanceKey,
      });
      logger.info('Contributor group relationship tuple removed', {
        group: config.ContributorGroupId,
      });

      return;
    }

    logger.info(
      'No action to take on delete as no owner or contributor defined'
    );

    return;
  }
  // If we are here, it means we are inserting a new entity
  logger.info('Creating owner / contributor', {
    instanceKey,
    orgKey: config.OrgKey,
  });

  // Poll until the resource instance is available
  const resourceExists = await pollForResourceInstance(
    logger,
    permitRsSDK,
    'rs_node',
    config.Id,
    config.OrgKey!
  );

  if (!resourceExists) {
    logger.warn(
      'Resource instance not found after 10 attempts, skipping role assignment'
    );

    return;
  }

  if (config.OwnerId) {
    logger.info('Creating owner role assignment', {
      user: config.OwnerId,
    });
    await permit.api.roleAssignments.assign({
      resource_instance: instanceKey,
      role: 'Owner',
      tenant: config.OrgKey,
      user: config.OwnerId,
    });
    logger.info('Owner role assignment created', {
      user: config.OwnerId,
    });

    return;
  }
  if (config.ContributorId) {
    logger.info('Creating contributor role assignment', {
      user: config.ContributorId,
    });
    await permit.api.roleAssignments.assign({
      resource_instance: instanceKey,
      role: 'Contributor',
      tenant: config.OrgKey,
      user: config.ContributorId,
    });
    logger.info('Contributor role assignment created', {
      user: config.ContributorId,
    });

    return;
  }
  if (config.OwnerGroupId) {
    logger.info('Creating owner group relationship tuple', {
      group: config.OwnerGroupId,
    });
    await permit.api.relationshipTuples.create({
      subject: `owner_group:${config.OwnerGroupId}`,
      relation: 'owner',
      object: instanceKey,
      tenant: config.OrgKey,
    });
    logger.info('Owner group relationship tuple created', {
      group: config.OwnerGroupId,
    });

    return;
  }
  if (config.ContributorGroupId) {
    logger.info('Creating contributor group relationship tuple', {
      group: config.ContributorGroupId,
    });
    await permit.api.relationshipTuples.create({
      subject: `contributor_group:${config.ContributorGroupId}`,
      relation: 'contributor',
      object: instanceKey,
      tenant: config.OrgKey,
    });
    logger.info('Contributor group relationship tuple created', {
      group: config.ContributorGroupId,
    });

    return;
  }

  logger.info('No action to take on insert as no owner or contributor defined');

  return;
};
