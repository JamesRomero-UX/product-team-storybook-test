import type { File } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { deleteFile } from 'src/s3Services';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import type { RisksmartDetailType } from '../notifications/eventBridgeUtils';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  RisksmartDetailType.DataChanged,
  DataChangeEvent<File, 'file'>,
  void
>(async (e) => {
  if (e.detail.table.name !== 'file' || e.detail.event.op !== 'DELETE') {
    throw new Error('Only file deletion events are supported');
  }

  logger.appendKeys({
    orgKey: e.detail.event.data.old.OrgKey,
  });

  logger.info('Deleting file from s3', {
    Id: e.detail.event.data.old.Id,
  });

  await deleteFile(e.detail.event.data.old.OrgKey, e.detail.event.data.old.Id);
});
