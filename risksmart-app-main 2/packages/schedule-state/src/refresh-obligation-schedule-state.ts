import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshObligationScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<ScheduleDataAccess, 'getLatestObligationAssessmentResult'>
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (
    ctx: ApiRequestContext,
    obligationId: string
  ): Promise<void> => {
    logger.info({ obligationId }, 'Refreshing obligation schedule state');
    const latestResult = await dataAccess.getLatestObligationAssessmentResult(
      ctx,
      obligationId
    );
    const latestDate = latestResult?.TestDate ?? null;
    await refreshScheduleState(ctx, { entityId: obligationId, latestDate });
  };
}
