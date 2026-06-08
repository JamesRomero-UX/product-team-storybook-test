import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { getFriendlyId } from '@/utils/friendlyId';

import { getAppetitePerformance } from './calculateAppetitePerformance';
import type { ActiveRiskAppetiteFields, AppetiteTableFields } from './types';

export const useLabelledFields = (
  records: ActiveRiskAppetiteFields[] | undefined
) => {
  const { getLabel } = useRating('risk_appetite');
  const { t } = useTranslation(['common']);
  const tiers = t('tiers', { returnObjects: true });
  const { getByValue: getAppetitePerformanceByValue } = useRating(
    'appetite_performance'
  );
  const formatters = useRiskScoreFormatters();
  const posture = useIsFeatureFlagEnabled('posture');

  return useMemo<AppetiteTableFields[] | undefined>(() => {
    return records?.map((d) => {
      const risk = d.risk;
      const appetite = d.appetite;
      if (!risk) {
        throw new Error('Missing risk');
      }
      if (!appetite) {
        throw new Error('Missing appetite');
      }
      const controlledRating = risk.riskScore?.ResidualRating;
      const latestControlled =
        risk.assessmentResults?.[0]?.riskAssessmentResult;
      const residualLikelihood =
        risk.riskScore?.ResidualLikelihood ??
        latestControlled?.Likelihood ??
        null;
      const residualImpact =
        risk.riskScore?.ResidualImpact ?? latestControlled?.Impact ?? null;

      const performance = getAppetitePerformance({
        ...appetite,
        controlledRating,
        posture,
      });

      return {
        Id: appetite.Id,
        TierLabelled: tiers[String(risk.Tier) as keyof typeof tiers],
        ControlledRating: controlledRating,
        ParentTitle: risk.Title,
        LowerAppetite: appetite.LowerAppetite,
        UpperAppetite: appetite.UpperAppetite,
        Performance: performance,
        ParentRiskId: getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId),
        ParentRiskGuid: risk.Id,
        Statement: appetite.Statement,
        LowerAppetiteLabelled: appetite.LowerAppetite
          ? getLabel(appetite.LowerAppetite)
          : 'Undefined',
        UpperAppetiteLabelled: appetite.UpperAppetite
          ? getLabel(appetite.UpperAppetite)
          : 'Undefined',
        ControlledLikelihoodValue: residualLikelihood,
        ControlledImpactValue: residualImpact,
        ControlledRatingLabelled:
          formatters({
            residualRating: controlledRating,
            residualLikelihood,
            residualImpact,
          }).getResidualLabel() ?? 'Undefined',
        PerformanceLabelled:
          getAppetitePerformanceByValue(performance)?.label ?? 'Undefined',
        CreatedAtTimestamp: appetite.CreatedAtTimestamp,
        ModifiedAtTimestamp: appetite.ModifiedAtTimestamp,
        ModifiedByUserName: appetite.modifiedByUser?.FriendlyName ?? null,
        ModifiedByUser: appetite.ModifiedByUser,
        CustomAttributeData: appetite.CustomAttributeData,
        allOwners: getAllOwnersCellValue(risk),
        allContributors: getAllContributorsCellValue(risk),
        SequentialId:
          getFriendlyId(Parent_Type_Enum.Appetite, appetite.SequentialId) ??
          '-',
        EffectiveDate: appetite.EffectiveDate ?? undefined,
      };
    });
  }, [
    getAppetitePerformanceByValue,
    getLabel,
    records,
    tiers,
    formatters,
    posture,
  ]);
};
