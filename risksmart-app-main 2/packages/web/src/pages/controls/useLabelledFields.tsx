import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import { notEmpty } from 'src/utilityTypes';
import { getTestScheduleStatus } from 'src/utils/table/utils/testScheduleStatusHelper';

import useEntityInfo from '@/hooks/getEntityInfo';
import { getFriendlyId } from '@/utils/friendlyId';
import { calculateTrend } from '@/utils/trendCalculation';

import {
  calculateDesignEffectiveness,
  calculateOverallEffectiveness,
  calculatePerformanceEffectiveness,
} from './calculateEffectiveness';
import { UNRATED } from './lookupData';
import type { ControlFlatFields, ControlTableFields } from './types';

export const useLabelledFields = (records: ControlFlatFields[] | undefined) => {
  const { t } = useTranslation(['common']);

  const frequency = t('frequency');
  const { getLabel: getLabelOverallEffectiveness } = useRating('effectiveness');
  const { getLabel: getLabelDesignEffectiveness } = useRating(
    'design_effectiveness'
  );
  const { getLabel: getLabelPerformanceEffectiveness } = useRating(
    'performance_effectiveness'
  );
  const { getLabel: getLabelTestScheduleStatus } = useRating(
    'test_schedule_status'
  );
  const { getLabel: getEffectivenessTrendLabel } = useRating(
    'effectiveness_trend'
  );
  const getEntityInfo = useEntityInfo();

  return useMemo<ControlTableFields[] | undefined>(() => {
    return records?.map((d) => {
      const OverallEffectiveness = calculateOverallEffectiveness(d);
      const DesignEffectiveness = calculateDesignEffectiveness(d);
      const PerformanceEffectiveness = calculatePerformanceEffectiveness(d);

      // Calculate trend from the first two test results (sorted by date desc)
      const testResults = d.testResults ?? [];
      const currentEffectiveness = testResults[0]?.OverallEffectiveness;
      const previousEffectiveness = testResults[1]?.OverallEffectiveness;
      const effectivenessTrend = calculateTrend(
        currentEffectiveness,
        previousEffectiveness
      );

      const associations = d.parents
        .map((p) => {
          if (!p?.parent?.ObjectType) {
            return;
          }
          const entityInfo = getEntityInfo(p?.parent?.ObjectType);

          return {
            label: `${
              p.parent.ObjectType && p.parent.SequentialId
                ? `${getFriendlyId(p.parent.ObjectType, p.parent.SequentialId)}: `
                : ''
            }${entityInfo.getTitle?.(p) ?? '-'} (${entityInfo.singular})`,
            url: entityInfo.url(p.parent.Id),
          };
        })
        .filter(notEmpty);

      return {
        ...d,
        ControlTypeLabelled: (d.Type as Control_Type_Enum) ?? '-',
        ParentTitle: associations,
        NextTestDate: d.scheduleState?.DueDate ?? null,
        NextTestOverdueDate: d.scheduleState?.OverdueDate ?? null,
        TestScheduleStatus: getTestScheduleStatus(
          d.scheduleState?.OverdueDate,
          d.scheduleState?.DueDate
        ),
        TestScheduleStatusLabelled:
          getLabelTestScheduleStatus(
            getTestScheduleStatus(
              d.scheduleState?.OverdueDate,
              d.scheduleState?.DueDate
            )
          ) ||
          getTestScheduleStatus(
            d.scheduleState?.OverdueDate,
            d.scheduleState?.DueDate
          ),
        DesignEffectiveness,
        DesignEffectivenessLabelled:
          DesignEffectiveness === null
            ? UNRATED.label
            : getLabelDesignEffectiveness(DesignEffectiveness) || UNRATED.label,
        PerformanceEffectiveness,
        PerformanceEffectivenessLabelled:
          PerformanceEffectiveness === null
            ? UNRATED.label
            : getLabelPerformanceEffectiveness(PerformanceEffectiveness) ||
              UNRATED.label,
        OverallEffectiveness,
        OverallEffectivenessLabelled:
          OverallEffectiveness === null
            ? UNRATED.label
            : getLabelOverallEffectiveness(OverallEffectiveness) ||
              UNRATED.label,
        OverallEffectivenessHistory: (d.testResults ?? [])
          .slice(1, 7)
          .map((c) => ({
            rating: c.OverallEffectiveness ?? 0,
            id: c.Id,
            testDate: c.TestDate,
          })),
        OverallEffectivenessTrend: effectivenessTrend,
        OverallEffectivenessTrendLabelled:
          getEffectivenessTrendLabel(effectivenessTrend) || '-',
        OwnerName: d.owners,
        OpenIssues: d.open_issue_aggregate.aggregate?.count ?? null,
        IssueCount: d.issues_aggregate.aggregate?.count ?? null,
        LinkedIndicatorCount: d.indicators_aggregate.aggregate?.count ?? 0,
        OpenActions: d.actions_aggregate.aggregate?.count ?? null,
        CreatedByUserName: d.createdByUser?.FriendlyName ?? null,
        TestFrequency: d.schedule?.Frequency
          ? frequency[d.schedule.Frequency]
          : null,
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Control, d.SequentialId)
          : '',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        LatestRatingDate: d.scheduleState?.LatestDate ?? '-',
        ControlGroups: d.parents
          .filter((c) => c.group)
          .map((c) => ({
            label: c.group?.Title ?? '',
            id: c.group?.Id ?? '',
          })),
      };
    });
  }, [
    frequency,
    getEffectivenessTrendLabel,
    getEntityInfo,
    getLabelDesignEffectiveness,
    getLabelPerformanceEffectiveness,
    getLabelOverallEffectiveness,
    getLabelTestScheduleStatus,
    records,
  ]);
};
