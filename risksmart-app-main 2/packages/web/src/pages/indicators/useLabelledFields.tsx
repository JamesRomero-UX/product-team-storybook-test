import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import useEntityInfo from '@/hooks/getEntityInfo';
import { getFriendlyId } from '@/utils/friendlyId';
import { getTestScheduleStatus } from '@/utils/table/utils/testScheduleStatusHelper';

import {
  conformanceRatingFromResults,
  getConformanceTrendRating,
} from './calculateConformanceRating';
import {
  latestResultValueFromData,
  previousResultValueFromData,
} from './latestResultValueFromData';
import {
  parentTitleFromLinkedParents,
  parentTypesFromLinkedParents,
} from './parentHelpers';
import type { IndicatorFlatFields, IndicatorTableFields } from './types';

export const useLabelledFields = (
  records: IndicatorFlatFields[] | undefined
) => {
  const { getLabel: getConformanceLabel } = useRating(
    'indicator_conformance_status'
  );
  const { getLabel: getTestFreqLabel } = useRating('frequency');
  const getEntityInfo = useEntityInfo();
  const { getLabel: trendGetLabel } = useRating('indicator_conformance_trend');
  const { getLabel: getLabelTestScheduleStatus } = useRating(
    'test_schedule_status'
  );

  return useMemo<IndicatorTableFields[] | undefined>(() => {
    return records?.map((d) => {
      const conformanceTrendValue = getConformanceTrendRating(
        d,
        d.orderedResults
      );
      const testScheduleStatus = getTestScheduleStatus(
        d.scheduleState?.OverdueDate,
        d.scheduleState?.DueDate
      );

      return {
        ...d,
        ParentTitle: parentTitleFromLinkedParents(d, getEntityInfo) || '-',
        ParentType:
          (parentTypesFromLinkedParents(d, getEntityInfo) || []).join(', ') ||
          '-',
        CreatedByUserName: d.createdBy?.FriendlyName || '-',
        ModifiedByUserName: d.modifiedBy?.FriendlyName || '-',
        LatestResultLabelled: latestResultValueFromData(d) || '-',
        PreviousResultLabelled: previousResultValueFromData(d) || '-',
        LatestResultDateLabelled: d.orderedResults[0]?.ResultDate || '-',
        Conformance: conformanceRatingFromResults(d),
        ConformanceLabelled: getConformanceLabel(
          conformanceRatingFromResults(d)
        ),
        ConformanceTrendValue: conformanceTrendValue,
        ConformanceTrend: trendGetLabel(conformanceTrendValue) || 'Static',
        TestFrequencyLabelled: getTestFreqLabel(d.schedule?.Frequency) || '-',
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Indicator, d.SequentialId)
          : '',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        NextTestDate: d.scheduleState?.DueDate ?? '-',
        NextTestOverdueDate: d.scheduleState?.OverdueDate ?? '-',
        TestScheduleStatus: testScheduleStatus,
        TestScheduleStatusLabelled:
          getLabelTestScheduleStatus(testScheduleStatus) || testScheduleStatus,
      };
    });
  }, [
    records,
    getEntityInfo,
    getConformanceLabel,
    trendGetLabel,
    getTestFreqLabel,
    getLabelTestScheduleStatus,
  ]);
};
