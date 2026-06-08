import { DATE_TIME_FORMAT_WITH_TIME } from '@risksmart-app/shared/knock/schemas';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import {
  getOrgDetails,
  getOrgFeatures,
  isNotificationsEnabled,
} from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import type { IssueOverdueEventDetail } from './issueOverduePoller';
import {
  getIssueById,
  getIssueParentIds,
  getSendNotificationsOptionsForIssueSubTypes,
} from './issueUtilities';
import {
  getAncestorContributors,
  getDirectParentContributors,
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectOwnerGroups,
  getObjectOwners,
  getRecipientObjects,
} from './recipientUtilities';
import type { NotificationArrayObject } from './utilities';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'issue-overdue';

export const handler = eventBridgeEventHandler<
  string,
  IssueOverdueEventDetail,
  void
>(async (e) => {
  const issueAssessment = e.detail.data;

  if (
    !(await isNotificationsEnabled({
      OrgKey: issueAssessment.OrgKey,
      Tenant: e.detail.meta.tenant,
    }))
  ) {
    return;
  }

  logger.appendKeys({
    orgKey: issueAssessment.OrgKey,
    tenant: e.detail.meta.tenant,
    issueId: issueAssessment.ParentIssueId,
  });
  logger.info('Processing issue over due notification');

  const orgMeta = await getOrgDetails({
    orgKey: issueAssessment.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  logger.info('Got org metadata');

  const issue = await getIssueById({
    parentIssueId: issueAssessment.ParentIssueId,
    tenant: e.detail.meta.tenant,
  });
  logger.info('Got issue');

  const idempotencyKey = `${workflowKey}-${issue.Id}-${issueAssessment.TargetCloseDate}`;
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

  const recipientObjects = await getRecipientObjects({
    objectId: issue.Id,
    orgKey: issue.OrgKey,
    eventKey: workflowKey,
    departmentIds: await getObjectDepartments({
      objectId: issue.Id,
      tenant: e.detail.meta.tenant,
    }),
  });
  logger.info('Got recipients', {
    recipientObjects,
  });

  const recipientOwners = await getObjectOwners({
    objectId: issue.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owners', {
    recipientOwnerIds: recipientOwners.map((c) => c.id),
  });

  const recipientOwnerGroups = await getObjectOwnerGroups({
    objectId: issue.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owner groups', {
    recipientOwnerGroupIds: recipientOwnerGroups.map((c) => c.id),
  });

  const recipientContributors = await getObjectContributors({
    objectId: issue.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient contributors', {
    recipientContributorIds: recipientContributors.map((c) => c.id),
  });

  // Get parent contributors based on feature flag
  const orgFeatures = await getOrgFeatures({
    orgKey: issue.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  const useDirectParentContributors = orgFeatures.includes('no_inherit');

  let parentContributors: NotificationArrayObject[] = [];
  if (useDirectParentContributors) {
    const parentIds = await getIssueParentIds({
      issueId: issue.Id,
      tenant: e.detail.meta.tenant,
    });
    parentContributors = await getDirectParentContributors({
      parentIds,
      tenant: e.detail.meta.tenant,
      orgKey: issue.OrgKey,
    });
    logger.info('Got direct parent contributors', {
      directParentContributorIds: parentContributors.map((c) => c.id),
    });
  } else {
    const ancestorContributors = await getAncestorContributors({
      objectId: issue.Id,
      tenant: e.detail.meta.tenant,
    });
    parentContributors = ancestorContributors
      .filter(
        (c): c is typeof c & { id: string; name: string } => !!c.id && !!c.name
      )
      .map((c) => ({
        id: c.id,
        email: c.email ?? undefined,
        name: c.name,
      }));
    logger.info('Got ancestor contributors', {
      ancestorContributorIds: parentContributors.map((c) => c.id),
    });
  }

  const recipientContributorsGroups = await getObjectContributorsGroups({
    objectId: issue.Id,
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

        ...parentContributors,
        ...recipientOwnerGroups.map((recipient) => ({
          collection: 'Org-user-groups',
          id: `${issue.OrgKey}-${recipient.id}`,
          name: recipient.name,
          email: recipient.email,
        })),
        ...recipientContributorsGroups.map((recipient) => ({
          collection: 'Org-user-groups',
          id: `${issue.OrgKey}-${recipient.id}`,
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
        org_id: issue.OrgKey,
        objectId: issue.Id,
        objectTitle: issue.Title,
        objectSequenceId: issue.SequentialId,
        objectTimeStamp: issueAssessment.TargetCloseDate
          ? new Date(issueAssessment.TargetCloseDate).toLocaleString(
              'en-GB',
              DATE_TIME_FORMAT_WITH_TIME
            )
          : '',
        orgName: orgMeta.OrgName,
        ...getSendNotificationsOptionsForIssueSubTypes(issue.Type)?.extraData,
      },
      tenant: issue.OrgKey,
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
