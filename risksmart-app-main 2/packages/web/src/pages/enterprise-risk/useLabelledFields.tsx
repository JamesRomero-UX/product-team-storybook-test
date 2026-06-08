import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getFriendlyId } from '@/utils/friendlyId';

import type {
  EnterpriseRiskFields,
  EnterpriseRiskRegisterFields,
} from './types';

export const useLabelledFields = (
  data: EnterpriseRiskFields[] | undefined
): EnterpriseRiskRegisterFields[] => {
  const { t } = useTranslation(['common']);
  const tiers = useMemo(() => t('tiers', { returnObjects: true }), [t]);
  const treatments = useMemo(
    () => t('treatments', { returnObjects: true }),
    [t]
  );
  const { getByValue: getResidualRating } = useRating('risk_controlled');
  const { getByValue: getInherentRating } = useRating('risk_uncontrolled');

  return useMemo(() => {
    return (
      data?.map((record) => ({
        ...record,
        SequentialIdLabelled: record.SequentialId
          ? getFriendlyId(Parent_Type_Enum.EnterpriseRisk, record.SequentialId)
          : '-',
        TierLabelled: tiers[String(record.Tier) as keyof typeof tiers],
        TreatmentLabelled:
          treatments[String(record.Treatment) as keyof typeof treatments],
        ParentTitle: record.parent?.Title ?? '-',
        CreatedByUser: record.createdByUser?.FriendlyName ?? '-',
        ModifiedByUser: record.modifiedByUser?.FriendlyName ?? '-',
        Description: record.Description ?? '-',
        InherentMeanLabelled:
          getInherentRating(record.score?.InherentRatingMean)?.label ?? '-',
        InherentWorstCaseLabelled:
          getInherentRating(record.score?.InherentRatingWorstCase)?.label ??
          '-',
        ResidualMeanLabelled:
          getResidualRating(record.score?.ResidualRatingMean)?.label ?? '-',
        ResidualWorstCaseLabelled:
          getResidualRating(record.score?.ResidualRatingWorstCase)?.label ??
          '-',
      })) ?? []
    );
  }, [data, tiers, treatments, getInherentRating, getResidualRating]);
};
