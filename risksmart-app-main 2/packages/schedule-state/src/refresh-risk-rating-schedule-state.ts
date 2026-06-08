import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshRiskRatingScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<
      ScheduleDataAccess,
      'getLatestRiskAssessmentResult' | 'getAggregationSettings'
    >
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (ctx: ApiRequestContext, riskId: string): Promise<void> => {
    logger.info({ riskId }, 'Refreshing risk rating schedule state');

    // 1. Get latest risk assessment result
    const latestResult = await dataAccess.getLatestRiskAssessmentResult(
      ctx,
      riskId
    );

    // 2. Get org aggregation settings
    const aggregationSettings = await dataAccess.getAggregationSettings(ctx);

    // 3. Skip if controlled assessment with aggregation scoring
    if (
      latestResult?.ControlType === 'Controlled' &&
      aggregationSettings?.RiskScoringModel &&
      (aggregationSettings.RiskScoringModel ===
        'ControlEffectivenessAverages' ||
        aggregationSettings.RiskScoringModel === 'NumberOfControlsWithGaps')
    ) {
      logger.info(
        { riskId },
        'Skipping risk rating refresh: controlled assessment with aggregation scoring'
      );

      return;
    }

    // 4. Extract latest date
    const latestDate = latestResult?.TestDate ?? null;

    // 5. Refresh schedule state
    await refreshScheduleState(ctx, { entityId: riskId, latestDate });
  };
}
