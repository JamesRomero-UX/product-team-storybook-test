import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { refreshScheduleState } from './scheduleStateService';

export const refreshObligationScheduleState = async ({
  obligationId,
  session,
}: {
  obligationId: string;
  session: SessionData;
}) => {
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { obligation_assessment_result: results } =
    await apiClient.getLatestRatingObligationAssessmentResultsByParentId({
      Id: obligationId,
    });

  const latestDate = results[0]?.TestDate ?? null;

  await refreshScheduleState({
    id: obligationId,
    session,
    latestDate,
  });
};
