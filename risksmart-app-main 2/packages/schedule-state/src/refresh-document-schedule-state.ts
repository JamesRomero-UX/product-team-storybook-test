import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';
import { logger } from './utils/logger';

export function createRefreshDocumentScheduleState(
  dataAccess: BaseScheduleAccess &
    Pick<ScheduleDataAccess, 'getLatestDocumentAssessmentResult'>
) {
  const refreshScheduleState = createRefreshScheduleState(dataAccess);

  return async (ctx: ApiRequestContext, documentId: string): Promise<void> => {
    logger.info({ documentId }, 'Refreshing document schedule state');
    const latestResult = await dataAccess.getLatestDocumentAssessmentResult(
      ctx,
      documentId
    );
    const latestDate = latestResult?.TestDate ?? null;
    await refreshScheduleState(ctx, { entityId: documentId, latestDate });
  };
}
