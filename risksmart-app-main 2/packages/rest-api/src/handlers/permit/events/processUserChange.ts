import type { PermitSDK } from '@risksmart-app/permitio/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';

import { getLogger } from '../../../logger';
const logger = getLogger();

export const processUserChange = async (
  permit: Permit,
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    Id: string;
  }
) => {
  logger.info('Processing user change to permit', {
    config,
  });
  const instanceKey = RS_NODE_ID(config.Id);
  logger.appendKeys({
    instanceKey,
  });
  if (config.OP === 'UPDATE') {
    logger.info(
      'No action to take on update. User should already be defined in Permit'
    );

    return;
  }

  if (config.OP === 'DELETE') {
    logger.info('Processing delete operation', {
      instanceKey,
    });

    // Poll until the resource instance is available
    const userExists = await permitRsSDK.userExists(config.Id);

    if (!userExists) {
      logger.warn('User does not exist, skipping deletion');

      return;
    }
    logger.info('Deleting user in Permit', {
      instanceKey,
    });

    await permit.api.users.delete(config.Id);
    logger.info('User deleted successfully');

    return;
  }
  // If we are here, it means we are inserting a new user
  logger.info('Creating user', {
    instanceKey,
  });

  // Poll until the resource instance is available
  const userExists = await permitRsSDK.userExists(config.Id);

  if (userExists) {
    logger.warn('User already exists, skipping creation');

    return;
  }

  logger.info('Creating user in Permit', {
    instanceKey,
  });

  await permit.api.users.create({
    key: config.Id,
  });

  logger.info('User created successfully');

  return;
};
