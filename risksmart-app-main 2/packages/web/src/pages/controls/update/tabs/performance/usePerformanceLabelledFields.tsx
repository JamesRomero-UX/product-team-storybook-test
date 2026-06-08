import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getFriendlyId } from '@/utils/friendlyId';

import type { PerformanceFlatFields, PerformanceRegisterFields } from './types';

export const usePerformanceLabelledFields = (
  records: PerformanceFlatFields[] | undefined
) => {
  const { t } = useTranslation(['common']);
  const effectiveness = useRating('effectiveness');
  const testTypeLookup = t('testTypes');

  return useMemo<PerformanceRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const parent = d.assessmentParents.filter((a) => a.assessment)[0]
          ?.assessment;

        return {
          ...d,
          SubmitterName: d.submitter?.FriendlyName || '-',
          FriendlyID: getFriendlyId(
            Parent_Type_Enum.TestResult,
            d.SequentialId
          ),
          OverallEffectivenessLabelled: effectiveness.getLabel(
            d.OverallEffectiveness
          ),
          TestTypeLabelled:
            testTypeLookup[d.TestType as keyof typeof testTypeLookup] ?? '-',
          AssessmentTitle: parent?.Title ?? '-',
        };
      }) || []
    );
  }, [effectiveness, records, testTypeLookup]);
};
