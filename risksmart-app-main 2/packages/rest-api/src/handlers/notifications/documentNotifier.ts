import type { Document, DocumentFile } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { isNotificationsEnabled } from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import type { NotificationObject } from './utilities';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';
const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  | DataChangeEvent<Document, 'document'>
  | DataChangeEvent<DocumentFile, 'document_file'>,
  void
>(async (e) => {
  checkEventAndEnvironmentStatus(e, ['document', 'document-file']);
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  logger.info('Processing document notification');
  let messageObject = createNotificationObject(sessionData);

  //Set message object properties base on table name and then type
  if (isTableName(e.detail, 'document')) {
    messageObject = ProcessDocumentObject(e.detail, messageObject);
  } else if (isTableName(e.detail, 'document_file')) {
    const message = await processChildObjects(e.detail, messageObject);
    if (!message) {
      return;
    }
    messageObject = message;
  } else {
    throw new Error('Only document tables are supported');
  }

  const idempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-${messageObject.TimeStamp}`;
  messageObject.IdempotencyKey = idempotencyKey;
  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  if (!(await isNotificationsEnabled(messageObject))) {
    return;
  }

  logger.info('sending notifications');
  //Send notifications
  await sendNotifications(messageObject);
  logger.info('Notification processing complete.');
});

const ProcessDocumentObject = (
  detail: DataChangeEvent<Document, 'document'>,
  messageObject: NotificationObject
): NotificationObject => {
  logger.appendKeys({
    op: detail.event.op,
    documentId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing document object');
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      messageObject.WorkflowKey = 'document-insert';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      messageObject.WorkflowKey = 'document-update';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.Id;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';
      messageObject.WorkflowKey = 'document-delete';
      messageObject.Title = detail.event.data.old.Title;
      messageObject.SequenceId = detail.event.data.old.SequentialId ?? '';
      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const processChildObjects = async (
  detail: DataChangeEvent<DocumentFile, 'document_file'>,
  messageObject: NotificationObject
): Promise<NotificationObject | undefined> => {
  logger.appendKeys({
    op: detail.event.op,
    documentId:
      detail.event.data.new?.ParentDocumentId ??
      detail.event.data.old?.ParentDocumentId,
    documentFileId: detail.event.data.new?.Id ?? detail.event.data.new?.Id,
  });
  const hasuraClient = getHasuraAdminClient(messageObject.Tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);
  logger.info('Processing document file object');
  if (detail.event.op === 'DELETE') {
    const { document_audit } = await apiClient.getDocumentAuditById({
      Id: detail.event.data.old?.ParentDocumentId,
    });
    if (
      document_audit &&
      document_audit.length > 0 &&
      document_audit[0]!.Action === 'DELETE'
    ) {
      logger.info(
        'Cant process document file deletion as parent document deleted.'
      );

      return;
    }
  }
  switch (detail.event.op) {
    case 'INSERT':
      //Get parent id and parent document

      messageObject.Id = detail.event.data.new.ParentDocumentId;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';

      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.ParentDocumentId;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';

      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.ParentDocumentId;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  const { document } = await apiClient.getDocumentById({
    Id: messageObject.Id,
  });
  if (!document[0]) {
    throw new Error('Document not found');
  }

  messageObject.WorkflowKey = 'document-update';
  messageObject.Title = document[0].Title;
  messageObject.SequenceId = document[0].SequentialId ?? '';

  return messageObject;
};
