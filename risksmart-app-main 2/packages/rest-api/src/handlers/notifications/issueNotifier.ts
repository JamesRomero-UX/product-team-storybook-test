import type { Cause, Consequence, Issue, IssueUpdate } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import {
  getOrgFeatures,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import {
  getIssueById,
  getIssueParentIds,
  getSendNotificationsOptionsForIssueSubTypes,
  isIssueBaseType,
} from './issueUtilities';
import { getDirectParentContributors } from './recipientUtilities';
import type { NotificationObject, SendNotificationsOptions } from './utilities';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';
const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  | DataChangeEvent<Issue, 'issue'>
  | DataChangeEvent<IssueUpdate, 'issue_update'>
  | DataChangeEvent<Cause, 'cause'>
  | DataChangeEvent<Consequence, 'consequence'>,
  void
>(async (e) => {
  //Log, check and return if event is not supported
  checkEventAndEnvironmentStatus(e, [
    'issue',
    'issue_update',
    'cause',
    'consequence',
  ]);
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  logger.info('Processing issue notifier trigger');
  let messageObject = createNotificationObject(sessionData);
  let sendNotificationsOptions: SendNotificationsOptions = {};
  if (isTableName(e.detail, 'issue')) {
    const type = e.detail.event.data.new?.Type ?? e.detail.event.data.old?.Type;
    if (!type) {
      throw new Error('No issue type. Unable to process');
    }
    if (!isIssueBaseType(type)) {
      logger.info('Not an issue base object. Ending.');

      return undefined;
    }

    messageObject = ProcessIssueObject(e.detail, messageObject);

    const orgFeatures = await getOrgFeatures({
      orgKey: messageObject.OrgKey,
      tenant: messageObject.Tenant,
    });
    const excludeAncestorContributors = orgFeatures.includes('no_inherit');

    if (excludeAncestorContributors) {
      // Get direct parent contributors for the issue
      const parentIds = await getIssueParentIds({
        issueId: messageObject.Id,
        tenant: messageObject.Tenant,
      });
      const directParentContributors = await getDirectParentContributors({
        parentIds,
        tenant: messageObject.Tenant,
        orgKey: messageObject.OrgKey,
      });

      sendNotificationsOptions = {
        ...getSendNotificationsOptionsForIssueSubTypes(type),
        extraRecipients: directParentContributors,
        excludeAncestorContributors: true,
      };
    } else {
      sendNotificationsOptions = {
        ...getSendNotificationsOptionsForIssueSubTypes(type),
      };
    }
  } else if (
    isTableName(e.detail, 'issue_update') ||
    isTableName(e.detail, 'cause') ||
    isTableName(e.detail, 'consequence')
  ) {
    const childObjectResult = await ProcessChildObjects(
      e.detail,
      messageObject
    );
    if (!childObjectResult) {
      logger.info('Not an issue object. Ending.');

      return;
    }
    messageObject = childObjectResult.messageObject;
    sendNotificationsOptions = childObjectResult.sendNotificationsOptions;
  } else {
    throw new Error(
      'Only issue_update, cause, consequence tables are supported'
    );
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
  await sendNotifications(messageObject, sendNotificationsOptions);
  logger.info('Notification processing complete.');
});

const ProcessIssueObject = (
  detail: DataChangeEvent<Issue, 'issue'>,
  messageObject: NotificationObject
): NotificationObject => {
  logger.appendKeys({
    op: detail.event.op,
    issueId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing issue object');
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      messageObject.WorkflowKey = 'issue-insert';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      messageObject.WorkflowKey = 'issue-update';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.Id;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';
      messageObject.WorkflowKey = 'issue-delete';
      messageObject.Title = detail.event.data.old.Title;
      messageObject.SequenceId = detail.event.data.old.SequentialId ?? '';
      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const ProcessChildObjects = async (
  detail:
    | DataChangeEvent<IssueUpdate, 'issue_update'>
    | DataChangeEvent<Cause, 'cause'>
    | DataChangeEvent<Consequence, 'consequence'>,
  messageObject: NotificationObject
): Promise<
  | {
      messageObject: NotificationObject;
      sendNotificationsOptions: SendNotificationsOptions;
    }
  | undefined
> => {
  logger.appendKeys({
    op: detail.event.op,
    issueId:
      detail.event.data.new?.ParentIssueId ??
      detail.event.data.old?.ParentIssueId,
    id: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing issue child object');
  switch (detail.event.op) {
    case 'INSERT':
      //Get parent id and parent risk

      messageObject.Id = detail.event.data.new.ParentIssueId;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';

      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.ParentIssueId;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';

      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.ParentIssueId;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  const parentIssue = await getIssueById({
    parentIssueId: messageObject.Id,
    tenant: messageObject.Tenant,
  });
  const type = parentIssue.Type;
  if (!isIssueBaseType(type)) {
    logger.info('Parent not an issue base object. Ending.');

    return undefined;
  }

  messageObject.WorkflowKey = 'issue-update';
  messageObject.Title = parentIssue.Title;
  messageObject.SequenceId = parentIssue.SequentialId ?? '';

  const orgFeatures = await getOrgFeatures({
    orgKey: messageObject.OrgKey,
    tenant: messageObject.Tenant,
  });
  const excludeAncestorContributors = orgFeatures.includes('no_inherit');

  return {
    messageObject,
    sendNotificationsOptions: {
      ...getSendNotificationsOptionsForIssueSubTypes(type),
      excludeAncestorContributors,
    },
  };
};
