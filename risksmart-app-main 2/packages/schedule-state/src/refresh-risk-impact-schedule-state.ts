import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshRiskImpactScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<ScheduleDataAccess, 'getOldestActiveImpactTestDate'>
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (ctx: ApiRequestContext, riskId: string): Promise<void> => {
    logger.info({ riskId }, 'Refreshing risk impact schedule state');
    const result = await dataAccess.getOldestActiveImpactTestDate(ctx, riskId);
    const latestDate = result?.oldestTestDate ?? null;
    await refreshScheduleState(ctx, { entityId: riskId, latestDate });
  };
}
