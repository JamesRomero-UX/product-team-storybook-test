import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { refreshScheduleState } from './scheduleStateService';

export const refreshDocumentScheduleState = async ({
  documentId,
  session,
}: {
  documentId: string;
  session: SessionData;
}) => {
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { document_assessment_result: results } =
    await apiClient.getLatestRatingDocumentAssessmentResultByParentId({
      Id: documentId,
    });

  const latestDate = results[0]?.TestDate ?? null;

  await refreshScheduleState({
    id: documentId,
    session,
    latestDate,
  });
};
