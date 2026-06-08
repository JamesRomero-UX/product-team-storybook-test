import type { SessionData } from 'src/session';

import { isOrgModuleEnabled } from '../orgUtilities';
import { refreshRiskImpactScheduleState } from './riskImpactScheduleStateService';
import { refreshRiskRatingScheduleState } from './riskRatingScheduleStateService';

export const refreshRiskScheduleState = async ({
  riskId,
  session,
}: {
  riskId: string;
  session: SessionData;
}) => {
  const impactsEnabled = await isOrgModuleEnabled(
    { orgKey: session.orgKey, tenant: session.tenant },
    'risk.subModules.impact'
  );
  if (impactsEnabled) {
    await refreshRiskImpactScheduleState({ riskId, session });
  } else {
    await refreshRiskRatingScheduleState({ riskId, session });
  }
};
