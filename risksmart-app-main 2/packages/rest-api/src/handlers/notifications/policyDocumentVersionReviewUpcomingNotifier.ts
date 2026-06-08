import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { isNotificationsEnabled } from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import type { PolicyDocumentVersionReviewDueEventDetail } from './policyDocumentVersionReviewDuePoller';
import type { PolicyDocumentVersionReviewUpcomingEventDetail } from './policyDocumentVersionReviewUpcomingPoller';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'policy-document-version-review-upcoming';

export const handler = eventBridgeEventHandler<
  string,
  PolicyDocumentVersionReviewUpcomingEventDetail,
  void
>(async (e) => {
  const documentFile = e.detail.data;

  if (
    !(await isNotificationsEnabled({
      OrgKey: documentFile.OrgKey,
      Tenant: e.detail.meta.tenant,
    }))
  ) {
    return;
  }
  logger.appendKeys({
    orgKey: documentFile.OrgKey,
    tenant: e.detail.meta.tenant,
    documentFileId: documentFile.Id,
  });
  logger.info('Processing document version view upcoming notification');

  const idempotencyKey = `${workflowKey}-${documentFile.Id}-${documentFile.NextReviewDate}`;
  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  const idempotencyKeyExists = await checkIdempotencyKeyExists(
    idempotencyKey,
    Table[
      `${e.detail.meta.tenant}_IdempotencyNotificationCheck` as keyof typeof Table
    ].tableName
  );

  if (idempotencyKeyExists) {
    logger.info('Idempotency check failed');

    return;
  }
  logger.info('Idempotency check passed. Processing notification');

  const recipientUserIds =
    documentFile.parent?.owners.map((o) => o.UserId) ?? [];

  if (recipientUserIds.length === 0) {
    return;
  }

  logger.info('Sending notification to knock');
  await sendNotification(recipientUserIds, e.detail.data, idempotencyKey);

  logger.info('Notification sent. Setting idempotency key');
  await setIdempotency(
    idempotencyKey,
    Table[
      `${e.detail.meta.tenant}_IdempotencyNotificationCheck` as keyof typeof Table
    ].tableName
  );
  logger.info('Notification processing complete.');
});

const sendNotification = async (
  recipientUserIds: string[],
  documentFile: PolicyDocumentVersionReviewDueEventDetail['data'],
  idempotencyKey: string
) => {
  await triggerNotification(
    workflowKey,
    {
      recipients: recipientUserIds,
      data: {
        objectId: documentFile.ParentDocumentId,
      },
      tenant: documentFile.OrgKey,
    },
    {
      idempotencyKey: idempotencyKey,
    }
  );
};
