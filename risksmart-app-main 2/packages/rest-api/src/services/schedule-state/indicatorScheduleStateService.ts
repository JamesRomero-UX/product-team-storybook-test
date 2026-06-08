import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { refreshScheduleState } from './scheduleStateService';

export const refreshIndicatorScheduleState = async ({
  indicatorId,
  session,
}: {
  indicatorId: string;
  session: SessionData;
}) => {
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { indicator_result: testResults } =
    await apiClient.getLatestIndicatorResult({
      IndicatorId: indicatorId,
    });

  const latestDate = testResults[0]?.ResultDate ?? null;

  await refreshScheduleState({
    id: indicatorId,
    session,
    latestDate,
  });
};
