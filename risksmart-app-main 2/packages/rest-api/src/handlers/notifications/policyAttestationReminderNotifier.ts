import dayjs from 'dayjs';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Table } from 'sst/node/table';

import type { DocumentFilePartsFragment } from '../../../generated/graphql';
import { getLogger } from '../../logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { DocumentVersionService } from '../../services/document-version/document-version.service';
import {
  getOrgDetails,
  isNotificationsEnabled,
} from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import type {
  PolicyAttestationReminderEventDetail,
  ReminderNotificationDetail,
} from './policyAttestationReminderPoller';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'policy-attestation-reminder';

export const handler = eventBridgeEventHandler<
  string,
  PolicyAttestationReminderEventDetail,
  void
>(async (e) => {
  const { orgKey } = e.detail.data;

  const orgMeta = await getOrgDetails({
    orgKey: orgKey,
    tenant: e.detail.meta.tenant,
  });

  if (
    !(await isNotificationsEnabled({
      OrgKey: orgKey,
      Tenant: e.detail.meta.tenant,
    }))
  ) {
    return;
  }
  logger.appendKeys({
    orgKey,
    tenant: e.detail.meta.tenant,
    policyId: e.detail.data.policyId,
  });
  logger.info('Processing attestation reminder notification');

  const documentService = DocumentVersionService({
    orgKey,
    tenant: e.detail.meta.tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const document = await documentService.findById(e.detail.data.policyId);
  logger.info('Got document');
  const currentDate = dayjs();
  const daysRemaining = dayjs(e.detail.data.expiresAtDate).diff(
    currentDate,
    'days'
  );
  logger.info('calculated days remaining', {
    currentDate: currentDate.toISOString(),
    daysRemaining,
  });
  const idempotencyKey = `${workflowKey}-${orgKey}-${e.detail.data.policyId}-${e.detail.data.expiresAtDate}-${daysRemaining}`;
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

  logger.info('Sending notification to knock');
  await sendNotification(
    e.detail.data.recipients,
    orgMeta.OrgName,
    orgMeta.Meta?.baseUrl ?? '',
    orgMeta.OrgKey,
    document,
    e.detail.data,
    idempotencyKey
  );

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
  orgName: string,
  deepLinkBaseUrl: string,
  deepLinkOrgId: string,
  document: DocumentFilePartsFragment,
  data: ReminderNotificationDetail,
  idempotencyKey: string
) => {
  await triggerNotification(
    workflowKey,
    {
      recipients: recipientUserIds,
      data: {
        orgName,
        deepLinkBaseUrl,
        deepLinkOrgId,
        org_id: data.orgKey,
        expiresAtDate: data.expiresAtDate,
        daysRemaining: dayjs(data.expiresAtDate).diff(dayjs(), 'days'),
        objectTitle: `${document.parent?.Title} (${document.Version})`,
        objectId: `${document.Id}`,
        parentObjectId: `${document.ParentDocumentId}`,
      },
      tenant: data.orgKey,
    },
    {
      idempotencyKey,
    }
  );
};
