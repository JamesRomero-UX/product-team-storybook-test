import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Obligation_Assessment_Result } from '@risksmart-app/web-graphql-client/derived-types';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getStatusByDate } from 'src/pages/assessments/config';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';
import type { RecursivePartial } from 'src/testing/stub';

import { getFriendlyId } from '@/utils/friendlyId';
import { calculateTrend } from '@/utils/trendCalculation';

import type { ObligationFields, ObligationTableFields } from './types';

export const useGetLabelledFields = (
  records: ObligationFields[] | undefined,
  latestAssessmentResults:
    | Array<null | RecursivePartial<Obligation_Assessment_Result> | undefined>
    | undefined
) => {
  const { t: tr } = useTranslation(['ratings']);
  const { t: tc } = useTranslation(['common']);
  const { t } = useTranslation(['common'], { keyPrefix: 'obligations' });
  const frequency = useMemo(() => tc('frequency'), [tc]);
  const { getByValue: getRatingTrendByValue } = useRating(
    'effectiveness_trend'
  );

  // Helper to calculate rating trend from assessment results history
  const getRatingTrend = (
    assessmentResults?:
      | {
          obligationAssessmentResult?: { Rating?: number | null } | null;
        }[]
      | null
  ) => {
    if (!assessmentResults || assessmentResults.length < 2) {
      return null;
    }
    const latestRating =
      assessmentResults[0]?.obligationAssessmentResult?.Rating;
    const previousRating =
      assessmentResults[1]?.obligationAssessmentResult?.Rating;
    if (latestRating == null || previousRating == null) {
      return null;
    }

    return calculateTrend(latestRating, previousRating);
  };

  return useMemo<ObligationTableFields[] | undefined>(() => {
    return records?.map((d) => {
      const latestAssessmentResult = latestAssessmentResults?.find((oar) => {
        return oar?.parents?.find((p) => p?.ParentId === d.Id);
      });

      // Calculate trend from assessment results history
      const ratingTrend = getRatingTrend(d.assessmentResults);

      return {
        ...d,
        LatestAssessmentResultsLabelled: [
          ...tr('performance_result_unrated'),
          ...tr('performance_result'),
        ]
          .filter((res) =>
            latestAssessmentResult?.Rating
              ? res.value === latestAssessmentResult?.Rating
              : res.value === 0
          )
          .map((res) => res.label)[0],
        LatestAssessmentResult: latestAssessmentResult?.Rating ?? 0,
        LatestAssessmentStatus: getStatusByDate(
          dayjs(),
          latestAssessmentResult?.parents?.find((p) => p?.assessment)
            ?.assessment?.StartDate,
          latestAssessmentResult?.parents?.find((p) => p?.assessment)
            ?.assessment?.ActualCompletionDate
        ),
        LinkedControlCount: d.controls_aggregate.aggregate?.count ?? 0,
        ParentTitle:
          d.Parent?.Title ??
          (d.parentNode
            ? getFriendlyId(
                Parent_Type_Enum.Obligation,
                d.parentNode?.SequentialId
              )
            : null) ??
          null,
        TypeLabel: t('fields.types')[d.Type] ?? '',
        CreatedBy: d.CreatedBy?.FriendlyName ?? null,
        ModifiedBy: d.ModifiedBy?.FriendlyName ?? null,
        Owner: d.owners,
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Obligation, d.SequentialId)
          : '',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        LatestRatingDate: d.scheduleState?.LatestDate ?? '-',
        NextTestDate: d.scheduleState?.DueDate ?? '-',
        TestFrequency: d.schedule?.Frequency
          ? frequency[d.schedule?.Frequency]
          : null,
        RatingTrend: ratingTrend,
        RatingTrendLabelled: getRatingTrendByValue(ratingTrend)?.label || '-',
      };
    });
  }, [
    records,
    t,
    tr,
    latestAssessmentResults,
    frequency,
    getRatingTrendByValue,
  ]);
};
