import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { getFriendlyId } from '@/utils/friendlyId';

import type { ControlTestFields, ControlTestTableFields } from './types';

export const useLabelledFields = (records: ControlTestFields[] | undefined) => {
  const { getLabel: getLabelOverallEffectiveness } = useRating('effectiveness');
  const { getLabel: getLabelDesignEffectiveness } = useRating(
    'design_effectiveness'
  );
  const { getLabel: getLabelPerformanceEffectiveness } = useRating(
    'performance_effectiveness'
  );
  const { getByValue } = useCommonLookupLazy();

  return useMemo<ControlTestTableFields[] | undefined>(() => {
    return records?.map((d) => {
      return {
        ...d,
        SequentialId: getFriendlyId(
          Parent_Type_Enum.TestResult,
          d.SequentialId
        ),
        ParentTitle: d.parent?.Title ?? null,
        CreatedByUserName: d.createdByUser?.FriendlyName ?? null,
        SubmitterNameLabelled: d.submitter?.FriendlyName ?? null,
        DesignEffectivenessLabelled: getLabelDesignEffectiveness(
          d.DesignEffectiveness
        ),
        PerformanceEffectivenessLabelled: getLabelPerformanceEffectiveness(
          d.PerformanceEffectiveness
        ),
        OverallEffectivenessLabelled: getLabelOverallEffectiveness(
          d.OverallEffectiveness
        ),
        TestTypeLabelled: getByValue('testTypes', d.TestType)?.label ?? '-',
        ControlSequentialId: getFriendlyId(
          Parent_Type_Enum.Control,
          d.parent?.SequentialId
        ),
        tags: d.parent?.tags ?? [],
        departments: d.parent?.departments ?? [],
        FileCount: d.files_aggregate.aggregate?.count ?? 0,
      };
    });
  }, [
    records,
    getLabelDesignEffectiveness,
    getLabelPerformanceEffectiveness,
    getLabelOverallEffectiveness,
    getByValue,
  ]);
};
