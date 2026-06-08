import dayjs from 'dayjs';
import type { AttestationRecord } from 'generated/graphql';
import { AttestationRecordStatusEnum } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { isNotificationsEnabled } from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { DocumentVersionService } from '../../services/document-version/document-version.service';
import { UserService } from '../../services/user/user.service';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import type { NotificationObject } from './utilities';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';

const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  DataChangeEvent<AttestationRecord, 'attestation_record'>,
  void
>(async (e) => {
  //Log, check and return if event is not supported
  checkEventAndEnvironmentStatus(e, ['attestation_record']);
  logger.appendKeys({ op: e.detail.event.op, tableName: e.detail.table.name });
  const attestationRecord = e.detail.event.data.new;
  if (
    !attestationRecord?.Active ||
    attestationRecord.AttestationStatus !== AttestationRecordStatusEnum.Pending
  ) {
    // if the attestation record is not active or is not pending, don't send a notification for it.
    logger.info('Notification not required', {
      Active: attestationRecord?.Active,
      AttestationStatus: attestationRecord?.AttestationStatus,
    });

    return;
  }
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  logger.info('got session data');
  let messageObject = createNotificationObject(sessionData);
  logger.info('created notification object');
  messageObject = processAttestationRecordNotificationObject(
    attestationRecord,
    messageObject
  );
  logger.info('processed attestation record notification');
  const idempotencyKey = `${messageObject.WorkflowKey}-${
    messageObject.Id
  }-${messageObject.TimeStamp}-${attestationRecord?.ExpiresAt ?? ''}`;
  messageObject.IdempotencyKey = idempotencyKey;

  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  if (!(await isNotificationsEnabled(messageObject))) {
    return;
  }

  logger.info('Processing notification');

  const userService = UserService({
    orgKey: messageObject.OrgKey,
    tenant: messageObject.Tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const documentVersionService = DocumentVersionService({
    orgKey: messageObject.OrgKey,
    tenant: messageObject.Tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const documentVersion = await documentVersionService.findById(
    attestationRecord.NodeId
  );
  if (!documentVersion) {
    throw new Error(
      'Not Implemented Error! non-document attestations are not supported. Please implement this if needed.'
    );
  }
  logger.appendKeys({
    documentVersionId: documentVersion.Id,
    documentId: documentVersion.ParentDocumentId,
  });

  logger.info('Got document version');

  const recipients = await userService.findById(attestationRecord.UserId);

  logger.info('Got recipients', {
    recipientCount: recipients.length,
    userId: attestationRecord.UserId,
  });

  //Send notifications
  await sendNotifications(messageObject, {
    excludeOwners: true,
    excludeContributors: true,
    extraRecipients: recipients.map((r) => ({
      email: r.Email ?? '',
      id: r.Id ?? '',
      name: r.UserName ?? '',
    })),
    extraData: {
      objectTitle: `${documentVersion.parent?.Title} (${documentVersion.Version})`,
      objectId: `${documentVersion.Id}`,
      parentObjectId: `${documentVersion.ParentDocumentId}`,
      expiresAtDate: attestationRecord.ExpiresAt
        ? dayjs(attestationRecord.ExpiresAt).format('DD/MM/YYYY HH:mm')
        : 'never',
    },
  });
  logger.info('Processing complete.');
});

const processAttestationRecordNotificationObject = (
  attestationRecord: AttestationRecord,
  messageObject: NotificationObject
): NotificationObject => {
  messageObject.Id = attestationRecord.Id;
  messageObject.TimeStamp = attestationRecord.ModifiedAtTimestamp;
  messageObject.OrgKey = attestationRecord.OrgKey;
  messageObject.Actor = attestationRecord.CreatedByUser ?? '';
  messageObject.WorkflowKey = 'attestation-record-insert';
  messageObject.Title = attestationRecord.NodeId;
  messageObject.SequenceId = '';

  return messageObject;
};
