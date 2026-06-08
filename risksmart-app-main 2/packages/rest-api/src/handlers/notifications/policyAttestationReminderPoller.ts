import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { hasLengthAtLeast, notEmpty } from '@risksmart-app/shared/typeGuards';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Config } from 'sst/node/config';
import { EventBus } from 'sst/node/event-bus';

import {
  AttestationRecordStatusEnum,
  GetAllActiveAttestationRecordsDocument,
} from '../../../generated/graphql';
import { eventBridgeEventHandler } from '../../eventBridgeHandler';
import { getHasuraClient } from '../../graphqlClient';
import { getLogger } from '../../logger';
import type { EventDetail, Meta } from './eventBridgeUtils';
import {
  RisksmartDetailType,
  sendToEventBridgeInBatches,
} from './eventBridgeUtils';
import { processScheduledDueDateNotifications } from './scheduleUtilities';
const logger = getLogger();

export interface ReminderNotificationDetail {
  recipients: string[];
  orgKey: string;
  policyId: string;
  expiresAtDate: string;
}

export type PolicyAttestationReminderEventDetail = EventDetail<
  Meta,
  ReminderNotificationDetail
>;

export const handler = eventBridgeEventHandler<
  string,
  { tenant: string },
  void
>(async (e) => {
  const tenant = e.detail.tenant;
  logger.appendKeys({
    tenant,
  });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const currentHour = dayjs(e.time).startOf('hour');
  logger.info('Polling for attestation reminders due', {
    currentHour: currentHour.toISOString(),
  });

  const { data, errors } = await hasuraClient.query({
    query: GetAllActiveAttestationRecordsDocument,
  });
  if (errors) {
    throw errors[0];
  }

  const filteredAttestations = data.attestation_record
    .filter((r) => r.AttestationStatus === AttestationRecordStatusEnum.Pending)
    .filter((r) => r.ExpiresAt !== null);

  logger.info('filtered Attestations due', {
    filteredAttestationCount: filteredAttestations.length,
  });

  const notifications = processScheduledDueDateNotifications(
    {
      data: filteredAttestations,
      dueDates: [
        { type: 'percentage', value: 0.5 },
        { type: 'relative', days: 3 },
        { type: 'relative', days: 2 },
        { type: 'relative', days: 1 },
      ],
      startDateGetter: (r) => r.CreatedAtTimestamp,
      dueDateGetter: (r) => r.ExpiresAt as string,
    },
    currentHour
  );

  logger.info('processed scheduled due date notifications', {
    notificationsCount: notifications.length,
  });

  const groupedNotifications = _.groupBy(
    notifications.map((n) => ({
      ...n,
      expiresAtDate: dayjs(n.objectData.ExpiresAt).format('YYYY-MM-DD'),
    })),
    (n) => {
      return `${n.objectData.OrgKey}#${n.objectData.NodeId}#${n.expiresAtDate}`;
    }
  );

  logger.info('grouped notifications', {
    groupedNotificationsCount: groupedNotifications.length,
  });

  const unsentEvents: PutEventsRequestEntry[] = Object.entries(
    groupedNotifications
  )

    .map(([_, notifications]) => {
      if (!hasLengthAtLeast(notifications, 1)) {
        return;
      }
      const detail: PolicyAttestationReminderEventDetail = {
        meta: { tenant },
        data: {
          recipients: notifications.map((n) => n.objectData.UserId),
          orgKey: notifications[0].objectData.OrgKey,
          policyId: notifications[0].objectData.NodeId,
          expiresAtDate: notifications[0].expiresAtDate,
        },
      };

      return {
        Detail: JSON.stringify(detail),
        DetailType: RisksmartDetailType.PolicyAttestationReminder,
        Source: 'risksmart.notifications',
        EventBusName: EventBus.SharedEventBus.eventBusName,
      };
    })
    .filter(notEmpty);

  logger.info('sending to event bridge', {
    unsentEntriesCount: unsentEvents.length,
  });

  await sendToEventBridgeInBatches(unsentEvents);
  logger.info('Completed processing');
});
