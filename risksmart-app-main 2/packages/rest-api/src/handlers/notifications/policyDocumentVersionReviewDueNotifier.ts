import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import {
  getOrgDetails,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import type { PolicyDocumentVersionReviewDueEventDetail } from './policyDocumentVersionReviewDuePoller';
import {
  getAncestorContributors,
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectOwnerGroups,
  getObjectOwners,
  getOrgRiskManagerIds,
  getRecipientObjects,
} from './recipientUtilities';
import type { NotificationArrayObject } from './utilities';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'policy-document-version-review-due';

export const handler = eventBridgeEventHandler<
  string,
  PolicyDocumentVersionReviewDueEventDetail,
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
  logger.info('Processing document version review due notification');

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

  const recipientUserIds = await getOrgRiskManagerIds({
    orgKey: documentFile.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  if (recipientUserIds.length === 0) {
    logger.info('No risk managers in org. Ending.');

    return;
  }

  logger.info('Sending notification to knock');
  const orgMeta = await getOrgDetails({
    orgKey: documentFile.OrgKey,
    tenant: e.detail.meta.tenant,
  });

  const recipientObjects = await getRecipientObjects({
    objectId: documentFile.ParentDocumentId,
    orgKey: documentFile.OrgKey,
    eventKey: workflowKey,
    departmentIds: await getObjectDepartments({
      objectId: documentFile.ParentDocumentId,
      tenant: e.detail.meta.tenant,
    }),
  });

  logger.info('Got recipients', {
    recipientObjects,
  });

  const recipientOwners = await getObjectOwners({
    objectId: documentFile.ParentDocumentId,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owners', {
    recipientOwnerIds: recipientOwners.map((c) => c.id),
  });

  const recipientOwnerGroups = await getObjectOwnerGroups({
    objectId: documentFile.ParentDocumentId,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owner groups', {
    recipientOwnerGroupIds: recipientOwnerGroups.map((c) => c.id),
  });

  const recipientContributors = await getObjectContributors({
    objectId: documentFile.ParentDocumentId,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient contributors', {
    recipientContributorIds: recipientContributors.map((c) => c.id),
  });

  const ancestorContributors = await getAncestorContributors({
    objectId: documentFile.ParentDocumentId,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got ancestor contributors', {
    ancestorContributorIds: ancestorContributors.map((c) => c.id),
  });

  const recipientContributorsGroups = await getObjectContributorsGroups({
    objectId: documentFile.ParentDocumentId,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient contributors groups', {
    recipientContributorsGroupIds: recipientContributorsGroups.map((c) => c.id),
  });

  logger.info('Triggering notification', {
    workflowKey,
  });

  await triggerNotification(
    workflowKey,
    {
      recipients: [
        ...recipientObjects.map((recipient) => ({
          collection: recipient.collection,
          id: recipient.id,
          name: recipient.name,
        })),
        ...recipientOwners.map((recipient) => ({
          email: recipient.email,
          id: recipient.id,
          name: recipient.name,
        })),
        ...recipientContributors.map((recipient) => ({
          email: recipient.email,
          id: recipient.id,
          name: recipient.name,
        })),

        ...ancestorContributors.map((recipient) =>
          recipient.group
            ? {
                collection: 'Org-user-groups',
                id: `${documentFile.OrgKey}-${recipient.id}`,
                name: recipient.name,
                email: recipient.email,
              }
            : {
                email: recipient.email,
                id: recipient.id,
                name: recipient.name,
              }
        ),
        ...recipientOwnerGroups.map((recipient) => ({
          collection: 'Org-user-groups',
          id: `${documentFile.OrgKey}-${recipient.id}`,
          name: recipient.name,
          email: recipient.email,
        })),
        ...recipientContributorsGroups.map((recipient) => ({
          collection: 'Org-user-groups',
          id: `${documentFile.OrgKey}-${recipient.id}`,
          name: recipient.name,
          email: recipient.email,
        })),
      ]
        .filter((a) => Object.keys(a).length !== 0)
        .reduce<NotificationArrayObject[]>((accumulator, currentItem) => {
          // Check if the accumulator already has an item with the same id
          if (!accumulator.some((item) => item.id === currentItem.id)) {
            accumulator.push(currentItem as NotificationArrayObject); // Add type assertion to fix the error
          }

          return accumulator;
        }, []),
      data: {
        org_id: documentFile.OrgKey,
        objectId: documentFile.ParentDocumentId,
        orgName: orgMeta.OrgName,
      },
      tenant: documentFile.OrgKey,
    },
    {
      idempotencyKey: idempotencyKey,
    }
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
