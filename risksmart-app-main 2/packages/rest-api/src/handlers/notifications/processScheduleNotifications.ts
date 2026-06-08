import { DATE_TIME_FORMAT_WITH_TIME } from '@risksmart-app/shared/knock/schemas';
import type { EventBridgeEvent } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import {
  getOrgDetails,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { RisksmartDetailType } from './eventBridgeUtils';
import {
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectOwnerGroups,
  getObjectOwners,
  getRecipientObjects,
} from './recipientUtilities';
import type { ScheduleEventDetail } from './scheduleNotifier';
import type { NotificationArrayObject } from './utilities';
import { triggerNotification } from './utilities';
const logger = getLogger();

type WorkflowMap = { [parentType in ParentTypeEnum]?: string };

const dueWorkflowMap: WorkflowMap = {
  [ParentTypeEnum.Control]: 'control-test-due',
  [ParentTypeEnum.Risk]: 'risk-assessment-due',
  [ParentTypeEnum.Indicator]: 'indicator-due',
  [ParentTypeEnum.Document]: 'document-due', // Not the same as policy version review
};
const overdueWorkflowMap: WorkflowMap = {
  [ParentTypeEnum.Control]: 'control-test-overdue',
  [ParentTypeEnum.Risk]: 'risk-assessment-overdue',
  [ParentTypeEnum.Indicator]: 'indicator-overdue',
  [ParentTypeEnum.Document]: 'document-overdue', // Not the same as policy version review
};

export async function processScheduleNotifications(
  e: EventBridgeEvent<string, ScheduleEventDetail>
) {
  logger.appendKeys({ detailType: e['detail-type'] });
  const { DateDue, OrgKey, Id, Title, SequentialId, ObjectType, ReminderNo } =
    e.detail.data;

  if (!DateDue) {
    throw new Error(`Missing DueDate`);
  }
  logger.appendKeys({
    dateDue: DateDue,
    orgKey: OrgKey,
  });
  logger.info('processing scheduled notifications');

  if (
    !(await isNotificationsEnabled({
      OrgKey,
      Tenant: e.detail.meta.tenant,
    }))
  ) {
    return;
  }

  let workflowMap: WorkflowMap;
  switch (e['detail-type']) {
    case RisksmartDetailType.ScheduleDue:
      workflowMap = dueWorkflowMap;
      break;
    case RisksmartDetailType.ScheduleOverdue:
      workflowMap = overdueWorkflowMap;
      break;
    default:
      logger.error('Missing workflow map for detail type', {
        ObjectType,
      });
      throw new Error('Missing workflow map for detail type');
  }

  const workflowKey = workflowMap[ObjectType];
  if (!workflowKey) {
    logger.error('Missing workflow key for object type', {
      ObjectType,
      detailType: e['detail-type'],
    });
    throw new Error('Missing workflow for object');
  }
  logger.appendKeys({ workflowKey });

  const idempotencyKey = `${workflowKey}-${Id}-${DateDue}-${ReminderNo}`;

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

  const orgMeta = await getOrgDetails({
    orgKey: OrgKey,
    tenant: e.detail.meta.tenant,
  });
  logger.info('Got org metadata');

  const recipientObjects = await getRecipientObjects({
    objectId: Id,
    orgKey: OrgKey,
    eventKey: workflowKey,
    departmentIds: await getObjectDepartments({
      objectId: Id,
      tenant: e.detail.meta.tenant,
    }),
  });

  const recipientOwners = await getObjectOwners({
    objectId: Id,
    tenant: e.detail.meta.tenant,
  });

  const recipientOwnerGroups = await getObjectOwnerGroups({
    objectId: Id,
    tenant: e.detail.meta.tenant,
  });

  const recipientContributors = await getObjectContributors({
    objectId: Id,
    tenant: e.detail.meta.tenant,
  });

  const recipientContributorsGroups = await getObjectContributorsGroups({
    objectId: Id,
    tenant: e.detail.meta.tenant,
  });

  const recipients = [
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
    ...recipientOwnerGroups.map((recipient) => ({
      collection: 'Org-user-groups',
      id: `${OrgKey}-${recipient.id}`,
      name: recipient.name,
      email: recipient.email,
    })),
    ...recipientContributorsGroups.map((recipient) => ({
      collection: 'Org-user-groups',
      id: `${OrgKey}-${recipient.id}`,
      name: recipient.name,
      email: recipient.email,
    })),
  ]
    .filter((a) => Object.keys(a).length !== 0)
    .reduce<NotificationArrayObject[]>((accumulator, currentItem) => {
      // Check if the accumulator already has an item with the same id
      if (!accumulator.some((item) => item.id === currentItem.id)) {
        accumulator.push(currentItem as NotificationArrayObject);
      }

      return accumulator;
    }, []);
  try {
    logger.info('Triggering notification', {
      workflowKey,
    });

    await triggerNotification(
      workflowKey,
      {
        recipients,
        data: {
          org_id: OrgKey,
          objectId: Id,
          objectTitle: Title,
          objectSequenceId: SequentialId,
          objectTimeStamp: DateDue
            ? new Date(DateDue).toLocaleString(
                'en-GB',
                DATE_TIME_FORMAT_WITH_TIME
              )
            : '',
          orgName: orgMeta.OrgName,
        },
        tenant: OrgKey,
      },
      {
        idempotencyKey,
      }
    );
  } catch (e) {
    logger.error(
      'Failed to trigger notification. Check knock logs for requestID',
      e as Error
    );
    throw e;
  }
  logger.info('Notification sent. Setting idempotency key');

  await setIdempotency(
    idempotencyKey,
    Table[
      `${e.detail.meta.tenant}_IdempotencyNotificationCheck` as keyof typeof Table
    ].tableName
  );
  logger.info('Notification processing complete.');
}
