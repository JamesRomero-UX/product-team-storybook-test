import type { PermitSDK } from '@risksmart-app/permitio/types';

import { getLogger } from '../../../logger';
const logger = getLogger();

export const processGroupUserChange = async (
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    Id: string;
    UserId?: string | undefined;
  }
) => {
  logger.info('Processing group user change');
  if (!config.UserId) {
    logger.warn('No UserId provided, skipping group user change processing');

    return;
  }

  if (config.OP === 'INSERT') {
    logger.info('Adding user to group', {
      groupId: config.Id,
      userId: config.UserId,
    });
    await permitRsSDK.addUserToGroup(config.Id, config.UserId, config.OrgKey!);

    return;
  }
  if (config.OP === 'DELETE') {
    logger.info('Removing user from group', {
      groupId: config.Id,
      userId: config.UserId,
    });
    await permitRsSDK.removeUserFromGroup(
      config.Id,
      config.UserId,
      config.OrgKey!
    );

    return;
  }
};
