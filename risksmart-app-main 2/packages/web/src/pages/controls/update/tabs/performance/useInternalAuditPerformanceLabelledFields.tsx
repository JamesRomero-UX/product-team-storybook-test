import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getFriendlyId } from '@/utils/friendlyId';

import type {
  InternalAuditPerformanceFlatFields,
  InternalAuditPerformanceRegisterFields,
} from './types';

export const useInternalAuditPerformanceLabelledFields = (
  records: InternalAuditPerformanceFlatFields[] | undefined
) => {
  const { t } = useTranslation(['common']);
  const effectiveness = useRating('effectiveness');
  const testTypeLookup = t('testTypes');

  return useMemo<InternalAuditPerformanceRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const parent = d.parents.filter((a) => a.internalAuditReport)[0]
          ?.internalAuditReport;

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
          NextTestDate: parent?.NextTestDate,
          InternalAuditReportTitle: parent?.Title ?? '-',
        };
      }) || []
    );
  }, [effectiveness, records, testTypeLookup]);
};
