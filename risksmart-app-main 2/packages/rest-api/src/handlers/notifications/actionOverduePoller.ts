import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import type { GetActionByDateDueQuery } from 'generated/graphql';
import { GetActionByDateDueDocument } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';
import { EventBus } from 'sst/node/event-bus';

import { getLogger } from '../../logger';
import type { EventDetail, Meta } from './eventBridgeUtils';
import {
  RisksmartDetailType,
  sendToEventBridgeInBatches,
} from './eventBridgeUtils';
import { processScheduledDueDateNotifications } from './scheduleUtilities';
const logger = getLogger();

export type ActionOverdueEventDetail = EventDetail<
  Meta,
  GetActionByDateDueQuery['action'][0]
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
  const hasuraClient = await getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  // events are only accurate to nearest minute
  const startOfHour = dayjs(e.time).startOf('hour');
  const minDateDue = startOfHour.subtract(1, 'day');
  logger.info('Polling for actions overdue', {
    minDateDue: minDateDue.toISOString(),
  });
  const { data, errors } = await hasuraClient.query({
    query: GetActionByDateDueDocument,
    variables: {
      minDateDue: minDateDue.toISOString(),
      maxDateDue: minDateDue.add(1, 'month').toISOString(),
    },
  });
  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to retrieve actions');
  }

  logger.info('Actions overdue', { actionsOverdue: data.action.length });

  const notifications = processScheduledDueDateNotifications(
    {
      data: data.action,
      dueDates: [
        { type: 'relative', days: -1 },
        { type: 'relative', days: -2 },
        { type: 'relative', days: -7 },
        { type: 'relative', days: -30 },
      ],
      dueDateGetter: (action) => action.DateDue,
      startDateGetter: (action) => action.CreatedAtTimestamp,
    },
    startOfHour
  );

  logger.info('Process scheduled due date notification', {
    notificationsCount: notifications.length,
  });

  const unsentEntries: PutEventsRequestEntry[] = notifications.map(
    (notification) => {
      const detail: ActionOverdueEventDetail = {
        meta: { tenant },
        data: notification.objectData,
      };

      return {
        Detail: JSON.stringify(detail),
        DetailType: RisksmartDetailType.ActionOverdue,
        Source: 'risksmart.notifications',
        EventBusName: EventBus.SharedEventBus.eventBusName,
      };
    }
  );

  logger.info('sending to event bridge', {
    unsentEntriesCount: unsentEntries.length,
  });

  await sendToEventBridgeInBatches(unsentEntries);
  logger.info('Completed processing');
});
