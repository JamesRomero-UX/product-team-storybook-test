import type { Action, ActionUpdate } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

import {
  getOrgFeatures,
  isNotificationsEnabled,
} from '../../services/orgUtilities';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import { getActionById, getActionParentIds } from './actionUtilities';
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
  | DataChangeEvent<Action, 'action'>
  | DataChangeEvent<ActionUpdate, 'action_update'>,
  void
>(async (e) => {
  checkEventAndEnvironmentStatus(e, ['action', 'action_update']);
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  let messageObject: NotificationObject | null;
  let sendNotificationsOptions: SendNotificationsOptions = {};
  if (isTableName(e.detail, 'action')) {
    logger.info('processing action table event');
    messageObject = processAction(e.detail, sessionData);

    const orgFeatures = await getOrgFeatures({
      orgKey: messageObject.OrgKey,
      tenant: messageObject.Tenant,
    });
    const excludeAncestorContributors = orgFeatures.includes('no_inherit');

    if (excludeAncestorContributors) {
      // Get direct parent contributors for the action
      const parentIds = await getActionParentIds({
        actionId: messageObject.Id,
        tenant: messageObject.Tenant,
      });
      const directParentContributors = await getDirectParentContributors({
        parentIds,
        tenant: messageObject.Tenant,
        orgKey: messageObject.OrgKey,
      });

      sendNotificationsOptions = {
        extraRecipients: directParentContributors,
        excludeAncestorContributors: true,
      };
    }
  } else if (isTableName(e.detail, 'action_update')) {
    messageObject = await processActionUpdates(e.detail, sessionData);

    if (messageObject) {
      const orgFeatures = await getOrgFeatures({
        orgKey: messageObject.OrgKey,
        tenant: messageObject.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      sendNotificationsOptions = { excludeAncestorContributors };
    }
  } else {
    throw new Error('Only action, action_update, tables are supported');
  }

  if (messageObject === null) {
    logger.info('No notification required');

    return;
  }

  messageObject.IdempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-${messageObject.TimeStamp}`;
  logger.appendKeys({ idempotencyKey: messageObject.IdempotencyKey });
  logger.info('created idempotency Key');

  if (!(await isNotificationsEnabled(messageObject))) {
    return;
  }

  logger.info('sending notifications');
  //Send notifications
  await sendNotifications(messageObject, sendNotificationsOptions);
  logger.info('Processing complete');
});

const processAction = (
  detail: DataChangeEvent<Action, 'action'>,
  sessionData: SessionData
): NotificationObject => {
  const messageObject = createNotificationObject(sessionData);
  const action = detail.event.data.new ?? detail.event.data.old;
  logger.appendKeys({
    actionId: action.Id,
  });
  messageObject.Id = action.Id;
  messageObject.OrgKey = action.OrgKey;
  messageObject.Title = action.Title;
  messageObject.SequenceId = action.SequentialId ?? '';
  logger.info('processing action table event', {
    op: detail.event.op,
  });
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      messageObject.WorkflowKey = 'action-insert';

      break;

    case 'UPDATE':
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      messageObject.WorkflowKey = 'action-update';

      break;

    case 'DELETE':
      messageObject.TimeStamp = detail.created_at;
      messageObject.Actor = messageObject.SessionActor ?? '';
      messageObject.WorkflowKey = 'action-delete';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const processActionUpdates = async (
  detail: DataChangeEvent<ActionUpdate, 'action_update'>,
  sessionData: SessionData
): Promise<NotificationObject | null> => {
  const messageObject = createNotificationObject(sessionData);
  const actionUpdate = detail.event.data.new ?? detail.event.data.old;
  messageObject.Id = actionUpdate.ParentActionId;
  logger.appendKeys({
    actionId: actionUpdate.ParentActionId,
    actionUpdateId: actionUpdate.Id,
  });
  messageObject.OrgKey = actionUpdate.OrgKey;
  logger.info('processing action update table event', {
    op: detail.event.op,
  });
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';

      break;

    case 'UPDATE':
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';

      break;

    case 'DELETE':
      messageObject.TimeStamp = detail.created_at;
      messageObject.Actor = messageObject.SessionActor ?? '';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  const action = await getActionById({
    actionId: messageObject.Id,
    tenant: messageObject.Tenant,
  });
  if (!action) {
    logger.info('Action not found');

    return null;
  }

  messageObject.WorkflowKey = 'action-update';
  messageObject.Title = action.Title;
  messageObject.SequenceId = action.SequentialId ?? '';

  return messageObject;
};
