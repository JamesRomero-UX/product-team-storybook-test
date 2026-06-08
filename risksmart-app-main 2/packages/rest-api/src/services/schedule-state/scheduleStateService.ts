import {
  getDueDate,
  getOverdueDate,
} from '@risksmart-app/shared/date/scheduleUtils';
import { TestFrequencyEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

const logger = getLogger();

export const refreshScheduleState = async ({
  id,
  session,
  latestDate,
}: {
  id: string;
  latestDate: string | null;
  session: SessionData;
}) => {
  logger.appendKeys({ scheduleId: id });
  logger.info('Refreshing schedule state');
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { node_by_pk } = await apiClient.getNode({ Id: id });
  if (!node_by_pk) {
    logger.info('Cannot update schedule. Node no longer exists');

    return;
  }
  const { schedule_by_pk: schedule } = await apiClient.getSchedule({ Id: id });
  if (!schedule) {
    logger.warn('Missing schedule');
  }
  const frequency = schedule?.Frequency;
  let dueDate: string | null | undefined;
  if (frequency == TestFrequencyEnum.Adhoc) {
    dueDate = schedule?.ManualDueDate;
  } else {
    if (frequency != undefined) {
      dueDate = getDueDate({
        startDate: schedule?.StartDate,
        latestDate,
        frequency,
      });
    }
  }

  const overdueDate = getOverdueDate({
    nextTestDate: dueDate,
    timeToCompleteValue: schedule?.TimeToCompleteValue,
    timeToCompleteUnit: schedule?.TimeToCompleteUnit,
  });
  const { schedule_state_by_pk } = await apiClient.getScheduleState({
    Id: id,
  });

  if (
    schedule_state_by_pk?.LatestDate === latestDate &&
    schedule_state_by_pk.OverdueDate === overdueDate &&
    schedule_state_by_pk.DueDate === dueDate
  ) {
    logger.info('Schedule state unchanged. No need to update');

    return;
  }

  await apiClient.upsertScheduleState({
    Id: id,
    DueDate: dueDate,
    OverdueDate: overdueDate,
    LatestDate: latestDate,
    ModifiedByUser: 'SYSTEM',
    OrgKey: session.orgKey,
    ModifiedAtTimestamp: new Date(Date.now()).toISOString(),
  });
  logger.info('Updated schedule state', { dueDate, overdueDate, latestDate });
};
