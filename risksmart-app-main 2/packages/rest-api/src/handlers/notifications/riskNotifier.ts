import type {
  Acceptance,
  Appetite,
  Indicator,
  IndicatorResult,
  Risk,
  RiskAssessmentResult,
} from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { getRisksByResultId } from 'src/services/risk/riskService';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import {
  getOrgFeatures,
  isNotificationsEnabled,
} from '../../services/orgUtilities';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import { getAcceptanceParentsById } from './acceptanceUtilities';
import { getAppetiteParentsById } from './appetiteUtilities';
import { getIndicatorParentsById } from './indicatorUtilities';
import { getRiskById } from './riskUtilities';
import type { NotificationObject, SendNotificationsOptions } from './utilities';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';

interface NotificationWithOptions {
  messageObject: NotificationObject;
  options?: SendNotificationsOptions;
}
const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  | DataChangeEvent<Risk, 'risk'>
  | DataChangeEvent<Appetite, 'appetite'>
  | DataChangeEvent<Indicator, 'indicator'>
  | DataChangeEvent<IndicatorResult, 'indicator_result'>
  | DataChangeEvent<Acceptance, 'acceptance'>
  | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>,
  void
>(async (e) => {
  checkEventAndEnvironmentStatus(e, [
    'risk',
    'appetite',
    'indicator',
    'indicator_result',
    'acceptance',
    'assessment',
    'risk_assessment_result',
  ]);
  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  const notifications: NotificationWithOptions[] = [];
  logger.info('Processing risk notifier trigger');
  //Set message object properties base on table name and then type
  if (isTableName(e.detail, 'risk')) {
    notifications.push({
      messageObject: processRiskObject(e.detail, sessionData),
      // Risk objects continue to notify all ancestor contributors
    });
  } else if (isTableName(e.detail, 'appetite')) {
    const messageObject = await processAppetiteObjects(e.detail, sessionData);
    const orgFeatures = await getOrgFeatures({
      orgKey: messageObject.OrgKey,
      tenant: messageObject.Tenant,
    });
    const excludeAncestorContributors = orgFeatures.includes('no_inherit');
    notifications.push({
      messageObject,
      options: { excludeAncestorContributors },
    });
  } else if (isTableName(e.detail, 'risk_assessment_result')) {
    const assessmentResults = await processAssessmentResultObjects(
      e.detail,
      sessionData
    );
    const firstResult = assessmentResults[0];
    if (firstResult) {
      const orgFeatures = await getOrgFeatures({
        orgKey: firstResult.OrgKey,
        tenant: firstResult.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      notifications.push(
        ...assessmentResults.map((messageObject) => ({
          messageObject,
          options: { excludeAncestorContributors },
        }))
      );
    }
  } else if (
    isTableName(e.detail, 'indicator') ||
    isTableName(e.detail, 'indicator_result')
  ) {
    const indicatorNotification = await processIndicatorObjects(
      e.detail,
      sessionData
    );
    if (indicatorNotification) {
      const orgFeatures = await getOrgFeatures({
        orgKey: indicatorNotification.OrgKey,
        tenant: indicatorNotification.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      notifications.push({
        messageObject: indicatorNotification,
        options: { excludeAncestorContributors },
      });
    }
  } else if (isTableName(e.detail, 'acceptance')) {
    const acceptanceNotification = await processAcceptanceObjects(
      e.detail,
      sessionData
    );
    if (acceptanceNotification) {
      const orgFeatures = await getOrgFeatures({
        orgKey: acceptanceNotification.OrgKey,
        tenant: acceptanceNotification.Tenant,
      });
      const excludeAncestorContributors = orgFeatures.includes('no_inherit');
      notifications.push({
        messageObject: acceptanceNotification,
        options: { excludeAncestorContributors },
      });
    }
  } else {
    throw new Error(
      'Only risk, appetite, indicator, indicator_result and acceptance tables are supported'
    );
  }

  notifications.forEach(
    ({ messageObject }) =>
      (messageObject.IdempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-${messageObject.TimeStamp}`)
  );

  for (const { messageObject, options } of notifications) {
    if (!(await isNotificationsEnabled(messageObject))) {
      continue;
    }
    //Send notifications
    logger.info('sending notifications', {
      idempotencyKey: messageObject.IdempotencyKey,
    });
    await sendNotifications(messageObject, options);
    logger.info('sent notifications', {
      idempotencyKey: messageObject.IdempotencyKey,
    });
  }
  logger.info('Notification processing complete.');
});

const processRiskObject = (
  detail: DataChangeEvent<Risk, 'risk'>,
  sessionData: SessionData
): NotificationObject => {
  const messageObject = createNotificationObject(sessionData);
  logger.appendKeys({
    op: detail.event.op,
    riskId: detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing risk object');
  switch (detail.event.op) {
    case 'INSERT':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';
      messageObject.WorkflowKey = 'risk-insert';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'UPDATE':
      messageObject.Id = detail.event.data.new.Id;
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';
      messageObject.WorkflowKey = 'risk-update';
      messageObject.Title = detail.event.data.new.Title;
      messageObject.SequenceId = detail.event.data.new.SequentialId ?? '';
      break;

    case 'DELETE':
      messageObject.Id = detail.event.data.old.Id;
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';
      messageObject.WorkflowKey = 'risk-delete';
      messageObject.Title = detail.event.data.old.Title;
      messageObject.SequenceId = detail.event.data.old.SequentialId ?? '';
      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  return messageObject;
};

const processAppetiteObjects = async (
  detail: DataChangeEvent<Appetite, 'appetite'>,
  sessionData: SessionData
): Promise<NotificationObject> => {
  const messageObject = createNotificationObject(sessionData);
  const id = detail.event.data.new?.Id ?? detail.event.data.old?.Id ?? '';
  logger.appendKeys({
    op: detail.event.op,
    appetiteId: id,
  });
  logger.info('Processing appetite object');

  const appetite = await getAppetiteParentsById({
    id: id,
    tenant: messageObject.Tenant,
  });

  if (!appetite.parents.find((p) => p.risk)) {
    throw new Error('Parent Risk ID for appetite not found');
  }

  switch (detail.event.op) {
    case 'INSERT':
      //Get parent id and parent risk
      messageObject.Id = appetite.parents.find((p) => p.risk)?.risk?.Id ?? '';
      logger.appendKeys({
        riskId: messageObject.Id,
      });
      messageObject.TimeStamp = detail.event.data.new.CreatedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.CreatedByUser ?? '';

      break;

    case 'UPDATE':
      messageObject.Id = appetite.parents.find((p) => p.risk)?.risk?.Id ?? '';
      logger.appendKeys({
        riskId: messageObject.Id,
      });
      messageObject.TimeStamp = detail.event.data.new.ModifiedAtTimestamp;
      messageObject.OrgKey = detail.event.data.new.OrgKey;
      messageObject.Actor = detail.event.data.new.ModifiedByUser ?? '';

      break;

    case 'DELETE':
      messageObject.Id =
        detail.event.data.old.parents.find((p) => p.risk)?.risk?.Id ?? '';
      logger.appendKeys({
        riskId: messageObject.Id,
      });
      messageObject.TimeStamp = detail.created_at;
      messageObject.OrgKey = detail.event.data.old.OrgKey;
      messageObject.Actor = messageObject.SessionActor ?? '';

      break;

    default:
      throw new Error('Only INSERT, UPDATE and DELETE events are supported');
  }

  const parentRisk = await getRiskById({
    riskId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  messageObject.WorkflowKey = 'risk-update';
  messageObject.Title = parentRisk.Title;
  messageObject.SequenceId = parentRisk.SequentialId ?? '';

  return messageObject;
};

const processIndicatorObjects = async (
  detail:
    | DataChangeEvent<Indicator, 'indicator'>
    | DataChangeEvent<IndicatorResult, 'indicator_result'>,
  sessionData: SessionData
): Promise<NotificationObject | undefined> => {
  const messageObject = createNotificationObject(sessionData);
  let id = '';
  if (isTableName(detail, 'indicator_result')) {
    id =
      detail.event.data.new?.IndicatorId ??
      detail.event.data.old?.IndicatorId ??
      '';
    logger.appendKeys({
      op: detail.event.op,
      indicatorResultId: id,
    });
  } else {
    id = detail.event.data.new?.Id ?? detail.event.data.old?.Id ?? '';
    logger.appendKeys({
      op: detail.event.op,
      indicatorId: id,
    });
  }

  logger.info('Getting indicator parents', {
    Id: id,
    Tenant: messageObject.Tenant,
  });

  const indicator = await getIndicatorParentsById({
    id: id,
    tenant: messageObject.Tenant,
  });

  if (!indicator?.parents?.[0]?.risk?.Id) {
    logger.info('Parent Risk ID for Indicator not found');

    return;
  }

  messageObject.Id = indicator.parents[0].risk.Id;
  logger.appendKeys({
    riskId: messageObject.Id,
  });
  messageObject.Title = indicator.parents[0].risk.Title;
  messageObject.SequenceId = indicator.parents[0].risk.SequentialId ?? '';
  messageObject.WorkflowKey = 'risk-update';

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

const processAcceptanceObjects = async (
  detail: DataChangeEvent<Acceptance, 'acceptance'>,
  sessionData: SessionData
): Promise<NotificationObject | undefined> => {
  const id = detail.event.data.new?.Id ?? detail.event.data.old?.Id ?? '';
  logger.appendKeys({
    op: detail.event.op,
    acceptanceId: id,
  });
  const messageObject = createNotificationObject(sessionData);
  logger.info('Getting acceptance parents');
  const acceptance = await getAcceptanceParentsById({
    id: id,
    tenant: messageObject.Tenant,
  });

  if (!acceptance?.parents?.[0]?.risk?.Id) {
    logger.info('Parent Risk ID for Acceptance not found');

    return;
  }
  const riskId = acceptance.parents[0].risk.Id;
  logger.appendKeys({
    riskId,
  });

  messageObject.Id = riskId;
  messageObject.Title = acceptance.parents[0].risk.Title;
  messageObject.SequenceId = acceptance.parents[0].risk.SequentialId ?? '';
  messageObject.WorkflowKey = 'risk-update';

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

const processAssessmentResultObjects = async (
  detail: DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>,
  sessionData: SessionData
): Promise<NotificationObject[]> => {
  const messageObject = createNotificationObject(sessionData);
  const hasuraClient = getHasuraClient({
    tenantName: messageObject.Tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });
  logger.appendKeys({
    op: detail.event.op,
    riskAssessmentResultId:
      detail.event.data.new?.Id ?? detail.event.data.old?.Id,
  });
  logger.info('Processing assessment result object');
  const messageObjects: NotificationObject[] = [];
  switch (detail.event.op) {
    case 'INSERT':
    case 'UPDATE': {
      const riskAssessmentResult = detail.event.data.new;
      const assessedRisks = await getRisksByResultId(
        hasuraClient,
        riskAssessmentResult.Id
      );
      logger.info('assessed risks', {
        riskIds: assessedRisks.map((c) => c.Id),
      });
      messageObjects.push(
        ...assessedRisks.map((assessedRisk) => ({
          ...messageObject,
          Id: assessedRisk.Id,
          TimeStamp: riskAssessmentResult.CreatedAtTimestamp,
          OrgKey: riskAssessmentResult.OrgKey,
          Actor: riskAssessmentResult.ModifiedByUser ?? '',
          WorkflowKey: 'risk-update',
          Title: assessedRisk.Title,
          SequenceId: assessedRisk.SequentialId ?? '',
        }))
      );

      break;
    }
    default:
      logger.warn(
        `Unsupported op ${detail.event.op}. Not creating message objects`
      );
  }

  return messageObjects;
};
