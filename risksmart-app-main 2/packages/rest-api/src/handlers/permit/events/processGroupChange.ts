import type { PermitSDK } from '@risksmart-app/permitio/types';

import { getLogger } from '../../../logger';
const logger = getLogger();
export const processGroupChange = async (
  permitRsSDK: PermitSDK,
  config: {
    OP: 'INSERT' | 'UPDATE' | 'DELETE';
    OrgKey?: string | undefined;
    Id: string;
  }
) => {
  logger.info('Processing group change');
  if (config.OP === 'INSERT') {
    logger.info('Creating group', {
      groupId: config.Id,
    });
    await permitRsSDK.createGroup(config.Id, config.OrgKey!);

    return;
  }
  if (config.OP === 'DELETE') {
    logger.info('Deleting group', {
      groupId: config.Id,
    });
    await permitRsSDK.deleteGroup(config.Id);

    return;
  }
};
