import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshIndicatorScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<ScheduleDataAccess, 'getLatestIndicatorResult'>
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (ctx: ApiRequestContext, indicatorId: string): Promise<void> => {
    logger.info({ indicatorId }, 'Refreshing indicator schedule state');
    const latestResult = await dataAccess.getLatestIndicatorResult(
      ctx,
      indicatorId
    );
    const latestDate = latestResult?.ResultDate ?? null;
    await refreshScheduleState(ctx, { entityId: indicatorId, latestDate });
  };
}
