import {
  RiskAssessmentResultControlTypeEnum,
  RiskScoringModelEnum,
} from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';

import { isOrgModuleEnabled } from '../orgUtilities';
import { refreshScheduleState } from './scheduleStateService';

const logger = getLogger();

export const refreshRiskRatingScheduleState = async ({
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
    logger.warn(
      'Not refreshing risk schedule for risk rating as risk.subModules.impact module is enabled'
    );

    return;
  }

  logger.appendKeys({
    riskId,
  });
  const hasuraClient = getHasuraAdminClient(session.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { risk_assessment_result: riskAssessmentResults } =
    await apiClient.getLatestRiskAssessmentResultByParentId({
      Id: riskId,
    });
  const riskAssessmentResult = riskAssessmentResults[0];
  if (!riskAssessmentResult) {
    logger.info('No risk assessment results found');
  }

  const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
    OrgKey: session.orgKey,
  });
  const aggregationSettings = aggregation_org?.[0];
  const allowedRiskScoringModels: RiskScoringModelEnum[] = [
    RiskScoringModelEnum.ControlEffectivenessAverages,
    RiskScoringModelEnum.NumberOfControlsWithGaps,
  ];

  if (
    riskAssessmentResult?.ControlType ===
      RiskAssessmentResultControlTypeEnum.Controlled &&
    aggregationSettings?.RiskScoringModel &&
    allowedRiskScoringModels.includes(aggregationSettings.RiskScoringModel)
  ) {
    logger.info(
      'Not updating schedule state for controlled assessment with aggregation enabled',
      {
        riskScoringModel: aggregationSettings.RiskScoringModel,
      }
    );

    return;
  }

  const latestDate = riskAssessmentResult?.TestDate ?? null;

  await refreshScheduleState({
    id: riskId,
    session,
    latestDate,
  });
};
