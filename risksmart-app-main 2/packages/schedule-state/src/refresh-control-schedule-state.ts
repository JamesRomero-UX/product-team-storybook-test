import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshControlScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<ScheduleDataAccess, 'getLatestTestResult'>
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (ctx: ApiRequestContext, controlId: string): Promise<void> => {
    logger.info({ controlId }, 'Refreshing control schedule state');
    const latestResult = await dataAccess.getLatestTestResult(ctx, controlId);
    const latestDate = latestResult?.TestDate ?? null;
    await refreshScheduleState(ctx, { entityId: controlId, latestDate });
  };
}
