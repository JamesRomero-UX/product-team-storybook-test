import { DATE_TIME_FORMAT_WITH_TIME } from '@risksmart-app/shared/knock/schemas';
import dayjs from 'dayjs';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import {
  getOrgDetails,
  getOrgFeatures,
  isNotificationsEnabled,
} from '../../services/orgUtilities';
import type { ActionDueEventDetail } from './actionDuePoller';
import { getActionParentIds } from './actionUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
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

const workflowKey = 'action-due';

export const handler = eventBridgeEventHandler<
  string,
  ActionDueEventDetail,
  void
>(async (e) => {
  const action = e.detail.data;

  if (
    !(await isNotificationsEnabled({
      OrgKey: action.OrgKey,
      Tenant: e.detail.meta.tenant,
    }))
  ) {
    return;
  }
  logger.appendKeys({
    orgKey: action.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  logger.info('Processing action due notification');

  const currentDate = dayjs();
  const daysRemaining = dayjs(action.DateDue).diff(currentDate, 'days');
  logger.info('calculated days remaining', {
    currentDate: currentDate.toISOString(),
    daysRemaining: daysRemaining,
  });

  const idempotencyKey = `${workflowKey}-${action.Id}-${action.DateDue}-${daysRemaining}`;
  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  //Call checkIdempotency and exit if false

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

  const orgMeta = await getOrgDetails({
    orgKey: action.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  logger.info('Got org metadata');

  const recipientObjects = await getRecipientObjects({
    objectId: action.Id,
    orgKey: action.OrgKey,
    eventKey: workflowKey,
    departmentIds: await getObjectDepartments({
      objectId: action.Id,
      tenant: e.detail.meta.tenant,
    }),
  });
  logger.info('Got recipients', {
    recipientObjects,
  });

  const recipientOwners = await getObjectOwners({
    objectId: action.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owners', {
    recipientOwnerIds: recipientOwners.map((c) => c.id),
  });

  const recipientOwnerGroups = await getObjectOwnerGroups({
    objectId: action.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient owner groups', {
    recipientOwnerGroupIds: recipientOwnerGroups.map((c) => c.id),
  });

  const recipientContributors = await getObjectContributors({
    objectId: action.Id,
    tenant: e.detail.meta.tenant,
  });

  logger.info('Got recipient contributors', {
    recipientContributorIds: recipientContributors.map((c) => c.id),
  });

  // Get parent contributors based on feature flag
  const orgFeatures = await getOrgFeatures({
    orgKey: action.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  const useDirectParentContributors = orgFeatures.includes('no_inherit');

  let parentContributors: NotificationArrayObject[] = [];
  if (useDirectParentContributors) {
    const parentIds = await getActionParentIds({
      actionId: action.Id,
      tenant: e.detail.meta.tenant,
    });
    parentContributors = await getDirectParentContributors({
      parentIds,
      tenant: e.detail.meta.tenant,
      orgKey: action.OrgKey,
    });
    logger.info('Got direct parent contributors', {
      directParentContributorIds: parentContributors.map((c) => c.id),
    });
  } else {
    const ancestorContributors = await getAncestorContributors({
      objectId: action.Id,
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
    objectId: action.Id,
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
          id: `${action.OrgKey}-${recipient.id}`,
          name: recipient.name,
          email: recipient.email,
        })),
        ...recipientContributorsGroups.map((recipient) => ({
          collection: 'Org-user-groups',
          id: `${action.OrgKey}-${recipient.id}`,
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
        org_id: action.OrgKey,
        objectId: action.Id,
        objectTitle: action.Title,
        objectSequenceId: action.SequentialId,
        objectTimeStamp: action.DateDue
          ? new Date(action.DateDue).toLocaleString(
              'en-GB',
              DATE_TIME_FORMAT_WITH_TIME
            )
          : '',
        orgName: orgMeta.OrgName,
      },
      tenant: action.OrgKey,
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
