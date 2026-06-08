import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { refreshScheduleState } from './scheduleStateService';

export const refreshControlScheduleState = async ({
  controlId,
  session,
}: {
  controlId: string;
  session: SessionData;
}) => {
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { test_result: testResults } =
    await apiClient.getLatestTestResultByParentControlId({
      Id: controlId,
    });

  const latestDate = testResults[0]?.TestDate ?? null;

  await refreshScheduleState({
    id: controlId,
    session,
    latestDate,
  });
};
