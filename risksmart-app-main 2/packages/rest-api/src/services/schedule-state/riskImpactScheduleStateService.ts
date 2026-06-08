import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { getOldestActiveImpactTestDate } from '../impactRatingService';
import { refreshScheduleState } from './scheduleStateService';

const logger = getLogger();

export const refreshRiskImpactScheduleState = async ({
  riskId,
  session,
}: {
  riskId: string;
  session: SessionData;
}) => {
  logger.appendKeys({
    riskId,
  });
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { impact: impacts } =
    await apiClient.getImpactsWithLatestDatedRiskRating({
      RatedItemId: riskId,
      OrgKey: session.orgKey,
    });

  const latestDate = getOldestActiveImpactTestDate(impacts);

  await refreshScheduleState({
    id: riskId,
    session,
    latestDate,
  });
};
