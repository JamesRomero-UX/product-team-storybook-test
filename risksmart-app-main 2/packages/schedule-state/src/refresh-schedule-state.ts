import type { BaseScheduleAccess } from './ports/schedule-data-access';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';
import { getDueDate, getOverdueDate } from './utils/schedule-utils';

export function createRefreshScheduleState(dataAccess: BaseScheduleAccess) {
  return async (
    ctx: ApiRequestContext,
    params: { entityId: string; latestDate: string | null }
  ): Promise<void> => {
    const { entityId, latestDate } = params;
    logger.info({ entityId }, 'Refreshing schedule state');

    // 1. Fetch schedule config
    const schedule = await dataAccess.getSchedule(ctx, entityId);
    if (!schedule) {
      logger.warn({ entityId }, 'No schedule configured, skipping refresh');

      return;
    }

    // 2. Calculate due date
    let dueDate: string | null | undefined;
    if (schedule.Frequency === 'adhoc') {
      dueDate = schedule.ManualDueDate;
    } else if (schedule.Frequency) {
      dueDate = getDueDate({
        startDate: schedule.StartDate,
        latestDate,
        frequency: schedule.Frequency,
      });
    }

    // 3. Calculate overdue date
    const overdueDate = getOverdueDate({
      nextTestDate: dueDate ?? null,
      timeToCompleteValue: schedule.TimeToCompleteValue,
      timeToCompleteUnit: schedule.TimeToCompleteUnit,
    });

    // 4. Fetch current state
    const currentState = await dataAccess.getScheduleState(ctx, entityId);

    // 5. Skip if unchanged
    if (
      currentState &&
      currentState.LatestDate === latestDate &&
      currentState.OverdueDate === (overdueDate ?? null) &&
      currentState.DueDate === (dueDate ?? null)
    ) {
      logger.info({ entityId }, 'Schedule state unchanged, skipping update');

      return;
    }

    // 6. Upsert schedule state
    await dataAccess.upsertScheduleState(ctx, entityId, {
      LatestDate: latestDate,
      DueDate: dueDate ?? null,
      OverdueDate: overdueDate,
    });
    logger.info(
      { entityId, dueDate, overdueDate, latestDate },
      'Schedule state updated'
    );
  };
}
