import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import type { GetOverdueSchedulesQuery } from 'generated/graphql';
import { TestFrequencyEnum, UnitOfTimeEnum } from 'generated/graphql';
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

  // Get all schedules that were due within the past hour
  const startOfHour = dayjs(e.time).startOf('hour');

  logger.appendKeys({ scheduleTime: startOfHour.toISOString() });

  const maxDueDate = startOfHour.toISOString();
  const minDueDate = startOfHour.add(-1, 'hour').toISOString();

  // Get all schedules that are going to be overdue within the past hour tomorrow
  const tomorrow = startOfHour.add(1, 'day');
  const maxOverdueDate = tomorrow.toISOString();
  const minOverdueDate = tomorrow.add(-1, 'hour').toISOString();

  const { schedule_state: dueSchedules } = await apiClient.getDueSchedules({
    minDueDate,
    maxDueDate,
  });

  logger.info('Due schedules fetched', {
    scheduleCount: dueSchedules.length,
    minDueDate,
    maxDueDate,
  });

  const { schedule_state: nearlyOverdue } = await apiClient.getOverdueSchedules(
    {
      minOverdueDate,
      maxOverdueDate,
    }
  );
  logger.info('Nearly overdue schedules fetched', {
    scheduleCount: nearlyOverdue.length,
    minOverdueDate,
    maxOverdueDate,
  });

  const unsentEntries: PutEventsRequestEntry[] = [];

  const scheduleLogger = logger.createChild();

  const nearlyOverdueRequiringNotification = nearlyOverdue.filter(
    (o) =>
      (o.schedule?.TimeToCompleteUnit !== UnitOfTimeEnum.Day ||
        o.schedule?.TimeToCompleteValue) ??
      0 > 1
  );

  logger.info('Nearly overdue requiring notification', {
    scheduleCount: nearlyOverdueRequiringNotification.length,
  });

  const scheduledToCheck: (GetOverdueSchedulesQuery['schedule_state'][number] & {
    ReminderNo: number;
  })[] = [
    ...dueSchedules.map((d) => ({ ...d, ReminderNo: 1 })),
    ...nearlyOverdueRequiringNotification.map((d) => ({
      ...d,
      ReminderNo: 2,
    })),
  ];

  logger.info('Schedules to check', {
    scheduledToCheck: scheduledToCheck.length,
  });

  scheduledToCheck.forEach((schedule) => {
    scheduleLogger.appendKeys({
      scheduleId: schedule.Id,
      dueDate: schedule.DueDate,
    });

    const frequency = schedule.schedule?.Frequency as TestFrequencyEnum;

    if (frequency === TestFrequencyEnum.Adhoc) {
      scheduleLogger.info('skipping adhoc schedule');

      return;
    }
    if (!schedule.DueDate) {
      scheduleLogger.error('Missing due date on schedule');

      return;
    }
    if (!schedule.parent?.ObjectType) {
      scheduleLogger.error('Missing object type on schedule');

      return;
    }

    const tenantMeta: Meta = { tenant };

    const detail: ScheduleEventDetail = {
      meta: tenantMeta,
      data: {
        ReminderNo: schedule.ReminderNo,
        ObjectType: schedule.parent?.ObjectType,
        DateDue: schedule.DueDate,
        Id: schedule.parent?.Id,
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
      DetailType: RisksmartDetailType.ScheduleDue,
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
