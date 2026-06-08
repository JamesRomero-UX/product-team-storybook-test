import {
  type ApiRequestContext,
  createRefreshControlScheduleState,
  createRefreshDocumentScheduleState,
  createRefreshIndicatorScheduleState,
  createRefreshObligationScheduleState,
  createRefreshRiskImpactScheduleState,
  createRefreshRiskRatingScheduleState,
  createRefreshRiskScheduleState,
} from '@risksmart-app/schedule-state';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import type { SessionData } from 'src/session';

import { createGraphQLScheduleDataAccess } from './schedule-state-adapter';

export function createScheduleRefresh(session: SessionData) {
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const dataAccess = createGraphQLScheduleDataAccess(
    hasuraClient,
    session.orgKey
  );
  const ctx: ApiRequestContext = {
    tenant: session.tenant,
    orgKey: session.orgKey,
    userId: session.userId,
  };

  return {
    ctx,
    refreshRiskScheduleState: createRefreshRiskScheduleState(dataAccess),
    refreshRiskRatingScheduleState:
      createRefreshRiskRatingScheduleState(dataAccess),
    refreshRiskImpactScheduleState:
      createRefreshRiskImpactScheduleState(dataAccess),
    refreshControlScheduleState: createRefreshControlScheduleState(dataAccess),
    refreshDocumentScheduleState:
      createRefreshDocumentScheduleState(dataAccess),
    refreshObligationScheduleState:
      createRefreshObligationScheduleState(dataAccess),
    refreshIndicatorScheduleState:
      createRefreshIndicatorScheduleState(dataAccess),
  };
}
