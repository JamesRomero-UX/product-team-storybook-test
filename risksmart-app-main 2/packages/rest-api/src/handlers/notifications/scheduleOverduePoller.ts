import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { Config } from 'sst/node/config';
import { EventBus } from 'sst/node/event-bus';

import { getLogger } from '../../logger';
import type { Meta } from './eventBridgeUtils';
import {
  RisksmartDetailType,
  sendToEventBridgeInBatches,
} from './eventBridgeUtils';
import type { ScheduleEventDetail } from './scheduleNotifier';
const logger = getLogger();

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
  const apiClient = getRisksmartApiClient(hasuraClient);

  const startOfHour = dayjs(e.time).startOf('hour');
  const minOverdueDate = startOfHour.add(-1, 'hour').toISOString();
  const maxOverdueDate = startOfHour.toISOString();

  const { schedule_state: schedules } = await apiClient.getOverdueSchedules({
    minOverdueDate,
    maxOverdueDate,
  });

  logger.info('Overdue schedules fetched', {
    scheduleCount: schedules.length,
    minOverdueDate,
    maxOverdueDate,
  });

  const tenantMeta: Meta = { tenant };
  const unsentEntries: PutEventsRequestEntry[] = [];
  schedules.forEach((schedule) => {
    if (!schedule.DueDate) {
      logger.error('Missing due date on schedule', {
        id: schedule.Id,
      });

      return;
    }
    if (!schedule.parent?.ObjectType) {
      logger.error('Missing object type on schedule', {
        id: schedule.Id,
      });

      return;
    }

    const detail: ScheduleEventDetail = {
      meta: tenantMeta,
      data: {
        ReminderNo: 1,
        ObjectType: schedule.parent?.ObjectType,
        DateDue: schedule.DueDate,
        Id: schedule.parent.Id,
        OrgKey: schedule.OrgKey,
        SequentialId: schedule.parent.SequentialId ?? 0,
        Title:
          schedule.parent?.risk?.Title ??
          schedule.parent?.control?.Title ??
          schedule.parent?.indicator?.Title ??
          '-',
      },
    };

    unsentEntries.push({
      Detail: JSON.stringify(detail),
      DetailType: RisksmartDetailType.ScheduleOverdue,
      Source: 'risksmart.notifications',
      EventBusName: EventBus.SharedEventBus.eventBusName,
    });
  });

  logger.info('sending to event bridge', {
    unsentEntriesCount: unsentEntries.length,
  });
  await sendToEventBridgeInBatches(unsentEntries);
  logger.info('Completed processing');
});
