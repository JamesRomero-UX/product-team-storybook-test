import type { ScheduleDataAccess } from './ports/schedule-data-access';
import { createRefreshRiskImpactScheduleState } from './refresh-risk-impact-schedule-state';
import { createRefreshRiskRatingScheduleState } from './refresh-risk-rating-schedule-state';
import type { ApiRequestContext } from './types';

export function createRefreshRiskScheduleState(dataAccess: ScheduleDataAccess) {
  const refreshRiskImpact = createRefreshRiskImpactScheduleState(dataAccess);
  const refreshRiskRating = createRefreshRiskRatingScheduleState(dataAccess);

  return async (
    ctx: ApiRequestContext,
    riskId: string,
    options: { useImpacts: boolean }
  ): Promise<void> => {
    if (options.useImpacts) {
      await refreshRiskImpact(ctx, riskId);
    } else {
      await refreshRiskRating(ctx, riskId);
    }
  };
}
