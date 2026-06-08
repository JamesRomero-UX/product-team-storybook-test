import type { EventBridgeEvent } from 'aws-lambda';
import type { ThirdPartyResponse } from 'generated/graphql';
import { ThirdPartyResponseStatusEnum } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { isNotificationsEnabled } from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';
const logger = getLogger();

const shouldIgnoreEvent = (
  e: EventBridgeEvent<
    string,
    DataChangeEvent<ThirdPartyResponse, 'third_party_response'>
  >
) => {
  if (e.detail.event.op !== 'UPDATE') {
    logger.info(
      'Processing third party response: Event type must be an update. Ignoring notification event.'
    );

    return true;
  }

  if (!isTableName(e.detail, 'third_party_response')) {
    logger.info(
      'Processing third party response: Event must be for third party response table. Ignoring notification event.'
    );

    return true;
  }

  if (
    e.detail.event.data.new.Status !==
    ThirdPartyResponseStatusEnum.AwaitingReview
  ) {
    logger.info(
      'Processing third party response: New status must be AwaitingReview. Ignoring notification event.'
    );

    return true;
  }

  const isOldStatusInProgress =
    e.detail.event.data.old.Status === ThirdPartyResponseStatusEnum.InProgress;
  const isOldStatusNotStarted =
    e.detail.event.data.old.Status === ThirdPartyResponseStatusEnum.NotStarted;

  if (!isOldStatusInProgress && !isOldStatusNotStarted) {
    logger.info(
      'Processing third party response: Old status must be either in_progress or not_started. Ignoring notification event.'
    );

    return true;
  }

  return false;
};

export const handler = eventBridgeEventHandler<
  string,
  DataChangeEvent<ThirdPartyResponse, 'third_party_response'>,
  void
>(async (e) => {
  checkEventAndEnvironmentStatus(e, ['third_party_response']);

  const sessionData = getSessionData(e.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });

  logger.info('Processing third party response: submitted trigger');

  let messageObject = createNotificationObject(sessionData);

  if (!e?.detail?.event?.data?.new) {
    logger.info('Processing third party response: No new data found in event.');

    return;
  }

  if (shouldIgnoreEvent(e)) {
    return;
  }

  messageObject = {
    ...messageObject,
    Id: e.detail.event.data.new.Id,
    TimeStamp: e.detail.event.data.new.ModifiedAtTimestamp,
    OrgKey: e.detail.event.data.new.OrgKey,
    Actor: e.detail.event.data.new.ModifiedByUser ?? '',
    WorkflowKey: 'third-party-response-submitted',
  };

  logger.info('Third party response to be processed', {
    Id: e.detail.event.data.new.Id,
  });

  const idempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-${messageObject.TimeStamp}`;
  messageObject.IdempotencyKey = idempotencyKey;

  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  if (!(await isNotificationsEnabled(messageObject))) {
    return;
  }

  logger.info('processing notifications');

  const hasuraClient = getHasuraClient({
    tenantName: sessionData.tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const apiClient = getRisksmartApiClient(hasuraClient);
  const data = await apiClient.getThirdPartyResponsesWithParents({
    where: { Id: { _eq: e.detail.event.data.new.Id } },
  });

  logger.info('sending notifications');

  await sendNotifications(messageObject, {
    extraData: {
      questionnaireTitle:
        data?.third_party_response?.[0]?.questionnaireTemplateVersion?.parent
          ?.Title ?? '',
      questionnaireVersion:
        data?.third_party_response?.[0]?.questionnaireTemplateVersion
          ?.Version ?? '',
      thirdPartyTitle: data?.third_party_response?.[0]?.thirdParty?.Title ?? '',
      thirdPartyId: data?.third_party_response?.[0]?.thirdParty?.Id ?? '',
    },
  });

  logger.info('Notification processing complete.');
});
