import type {
  Control,
  Indicator,
  IndicatorResult,
  TestResult,
} from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import {
  getOrgFeatures,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import { getControlById, getControlParentIds } from './controlUtilities';
import { getIndicatorParentsById } from './indicatorUtilities';
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
  | DataChangeEvent<Control, 'control'>
  | DataChangeEvent<Indicator, 'indicator'>
  | DataChangeEvent<IndicatorResult, 'indicator_result'>
  | DataChangeEvent<TestResult, 'test_result'>,
  void
>(async (e) => {
  //Log, check and return if event is not supported
  checkEventAndEnvironmentStatus(e, [
    'control',
    'indicator',
    'indicator-result',
    'test-result',
  ]);
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  logger.info('Processing control notifier trigger');
  let messageObject: NotificationObject | null =
    createNotificationObject(sessionData);
  let sendNotificationsOptions: SendNotificationsOptions = {};

  if (isTableName(e.detail, 'control')) {
    messageObject = ProcessControlObject(e.detail, messageObject);

    const orgFeatures = await getOrgFeatures({
      orgKey: messageObject.OrgKey,
      tenant: messageObject.Tenant,
    });
    const excludeAncestorContributors = orgFeatures.includes('no_inherit');

    if (excludeAncestorContributors) {
      // Get direct parent contributors for the control
      const parentIds = await getControlParentIds({
        controlId: messageObject.Id,
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
  } else if (isTableName(e.detail, 'test_result')) {
    messageObject = await processTestResults(e.detail, messageObject);

    if (messageObject) {
      const orgFeatures = await getOrgFeatures({
        orgKey: messageObject.OrgKey,
        tenant: messageObject.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      sendNotificationsOptions = { excludeAncestorContributors };
    }
  } else if (
    isTableName(e.detail, 'indicator') ||
    isTableName(e.detail, 'indicator_result')
  ) {
    messageObject = await ProcessIndicatorObjects(e.detail, messageObject);

    if (messageObject) {
      const orgFeatures = await getOrgFeatures({
        orgKey: messageObject.OrgKey,
        tenant: messageObject.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      sendNotificationsOptions = { excludeAncestorContributors };
    }
  } else {
    throw new Error(
      'Only control, indicator, indicator_result tables are supported'
    );
  }

  if (messageObject === null) {
    logger.info('No notification required');

    return;
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

const ProcessControlObject = (
  detail: DataChangeEvent<Control, 'control'>,
  messageObject: NotificationObject
): NotificationObject => {
  logger.appendKeys({
    op: detail.event.op,
    controlId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing control object');
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      messageObject.WorkflowKey = 'control-insert';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      messageObject.WorkflowKey = 'control-update';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.Id;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';
      messageObject.WorkflowKey = 'control-delete';
      messageObject.Title = detail.event.data.old.Title;
      messageObject.SequenceId = detail.event.data.old.SequentialId ?? '';
      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const ProcessIndicatorObjects = async (
  detail:
    | DataChangeEvent<Indicator, 'indicator'>
    | DataChangeEvent<IndicatorResult, 'indicator_result'>,
  messageObject: NotificationObject
): Promise<NotificationObject | null> => {
  let id = '';
  if (isTableName(detail, 'indicator_result')) {
    logger.appendKeys({
      op: detail.event.op,
      indicatorId:
        detail.event.data.new?.IndicatorId ??
        detail.event.data.old?.IndicatorId,
      indicatorResultId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
    });
    logger.info('Processing indicator result object');
    id =
      detail.event.op === 'DELETE'
        ? detail.event.data.old.IndicatorId
        : detail.event.data.new.IndicatorId;
  } else {
    logger.appendKeys({
      op: detail.event.op,
      indicatorId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
    });
    logger.info('Processing indicator object');
    id =
      detail.event.op === 'DELETE'
        ? detail.event.data.old.Id
        : detail.event.data.new.Id;
  }

  const indicator = await getIndicatorParentsById({
    id: id,
    tenant: messageObject.Tenant,
  });

  if (!indicator?.parents?.[0]?.control?.Id) {
    logger.info('Parent Control ID for Indicator not found');

    return null;
  }
  logger.appendKeys({
    controlId: indicator.parents[0].control.Id,
  });
  logger.info('Got indicator parent');

  messageObject.Id = indicator.parents[0].control.Id;
  messageObject.Title = indicator.parents[0].control.Title;
  messageObject.SequenceId = indicator.parents[0].control.SequentialId ?? '';
  messageObject.WorkflowKey = 'control-update';

  switch (detail.event.op) {
    case 'INSERT':
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      break;

    case 'UPDATE':
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      break;

    case 'DELETE':
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';
      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const processTestResults = async (
  detail: DataChangeEvent<TestResult, 'test_result'>,
  messageObject: NotificationObject
): Promise<NotificationObject | null> => {
  logger.appendKeys({
    op: detail.event.op,
    ControlId:
      detail.event.data.new?.ParentControlId ??
      detail.event.data.old?.ParentControlId,
    TestResultId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing test result object');
  switch (detail.event.op) {
    case 'INSERT':
      //Get parent id and parent risk

      messageObject.Id = detail.event.data.new.ParentControlId;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';

      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.ParentControlId;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';

      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.ParentControlId;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  const parentControl = await getControlById({
    controlId: messageObject.Id,
    tenant: messageObject.Tenant,
  });
  if (!parentControl) {
    logger.info('Control not found.');

    return null;
  }

  messageObject.WorkflowKey = 'control-update';
  messageObject.Title = parentControl.Title;
  messageObject.SequenceId = parentControl.SequentialId ?? '';

  return messageObject;
};
