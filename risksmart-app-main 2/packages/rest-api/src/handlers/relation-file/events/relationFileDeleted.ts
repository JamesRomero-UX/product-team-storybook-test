import type { RelationFile } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { deleteFile } from 'src/services/file/fileService';
import { getFileRelatedFileCount } from 'src/services/relation-file/relationFileService';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
import type { RisksmartDetailType } from '../../notifications/eventBridgeUtils';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  RisksmartDetailType.DataChanged,
  DataChangeEvent<RelationFile, 'relation_file'>,
  void
>(async (e) => {
  if (
    e.detail.table.name !== 'relation_file' ||
    e.detail.event.op !== 'DELETE'
  ) {
    throw new Error('Only relation file deletion events are supported');
  }

  const fileId = e.detail.event.data.old?.FileId;

  if (fileId === undefined) {
    logger.info(`Not processing due to missing required data in event`);

    return;
  }

  const sessionData = getSessionData(e.detail.event?.session_variables);
  logger.appendKeys({
    ...sessionData,
  });

  const hasuraClient = getHasuraAdminClient(sessionData.tenant);

  const data = await getFileRelatedFileCount(hasuraClient, {
    FileId: fileId,
  });

  if (data === undefined || data.length === 0) {
    logger.info('No file found with file ID');

    return;
  }

  if (data[0]?.relationFile_aggregate?.aggregate?.count != 0) {
    logger.info('File is still in use');

    return;
  }

  logger.info('Deleting file');

  await deleteFile(hasuraClient, {
    FileId: fileId,
  });
});
