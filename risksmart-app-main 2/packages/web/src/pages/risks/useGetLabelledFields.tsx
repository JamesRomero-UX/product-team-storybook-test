import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { GetAppetitesGroupedByImpactQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRiskRatingResolver } from 'src/ratings/useRiskRatingResolver';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import type { RiskScore } from '@/hooks/useRiskScore';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import type { JSONObject } from '@/types/types';
import { getFriendlyId } from '@/utils/friendlyId';
import { getTestScheduleStatus } from '@/utils/table/utils/testScheduleStatusHelper';
import { calculateTrend, type TrendIndicator } from '@/utils/trendCalculation';

import { getAppetitePerformance } from '../appetites/calculateAppetitePerformance';
import { UNRATED } from '../controls/lookupData';
import { getImpactPerformanceScore } from '../impacts/ratings/performanceCalculation';
import type { RiskFields, RiskRegisterFields } from './types';

export const useGetLabelledFields = (
  records: RiskFields[] | undefined,
  riskScores: RiskScore[] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined
) => {
  const { getByValue: getCommonLookupByValue } = useCommonLookupLazy();
  const { t: tt } = useTranslation('ratings');
  const riskScoreFormatters = useRiskScoreFormatters();
  const { resolveImpact, resolveLikelihood } = useRiskRatingResolver();
  const { getLabel: getTaxonomyLikelihoodLabel } = useRating('likelihood');
  const { getLabel: getTaxonomyImpactLabel } = useRating('impact');
  const getImpactLabel = useCallback(
    (value: number | null | undefined) =>
      resolveImpact(value)?.label ?? getTaxonomyImpactLabel(value),
    [resolveImpact, getTaxonomyImpactLabel]
  );
  const getLikelihoodLabel = useCallback(
    (value: number | null | undefined) =>
      resolveLikelihood(value)?.label ?? getTaxonomyLikelihoodLabel(value),
    [resolveLikelihood, getTaxonomyLikelihoodLabel]
  );
  const { getLabel: getAppetiteLabel } = useRating('risk_appetite');
  const { getByValue: getAppetitePerformanceByValue } = useRating(
    'appetite_performance'
  );
  const { getLabel: getRatingTrendLabel } = useRating('rating_trend');
  const { getLabel: getLabelTestScheduleStatus } = useRating(
    'test_schedule_status'
  );
  const posture = useIsFeatureFlagEnabled('posture');
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');

  return useMemo<RiskRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      const riskScore = riskScores?.find((r) => r.id === d.Id);
      const latestAppetite = d.appetites?.[0]?.appetite;

      const appetitePerformance = getAppetitePerformance({
        UpperAppetite: latestAppetite?.UpperAppetite,
        LowerAppetite: latestAppetite?.LowerAppetite,
        controlledRating: riskScore?.residualRating,
        posture,
      });

      return {
        ...d,
        TierLabelled: getCommonLookupByValue('tiers', d.Tier)?.label ?? '',
        TreatmentLabelled:
          getCommonLookupByValue('treatments', d.Treatment)?.label ?? null,
        StatusLabelled:
          getCommonLookupByValue('statuses', d.Status)?.label ?? null,
        UncontrolledRatingLabelled:
          riskScoreFormatters(riskScore).getInherentLabel() ?? UNRATED.label,
        ControlledRatingLabelled:
          riskScoreFormatters(riskScore).getResidualLabel() ?? UNRATED.label,
        UpperAppetiteLabelled: getAppetiteLabel(latestAppetite?.UpperAppetite),
        LowerAppetiteLabelled: getAppetiteLabel(latestAppetite?.LowerAppetite),
        AppetitePerformance: appetitePerformance,
        AppetitePerformanceLabelled:
          getAppetitePerformanceByValue(appetitePerformance)?.label ??
          'Undefined',
        LinkedControlCount: d.controls_aggregate.aggregate?.count || 0,
        LinkedIndicatorCount: d.indicators_aggregate.aggregate?.count || 0,
        LinkedActionCount: d.actions_aggregate?.aggregate?.count || 0,
        ParentTitle:
          d.parent?.Title ??
          (d.parentNode
            ? getFriendlyId(Parent_Type_Enum.Risk, d.parentNode?.SequentialId)
            : null) ??
          null,
        UncontrolledRating: riskScore?.inherentRating ?? null,
        ControlledRating: riskScore?.residualRating ?? null,
        UncontrolledScore: riskScore?.inherentScore ?? null,
        ControlledScore: riskScore?.residualScore ?? null,
        UserName: d.createdByUser?.FriendlyName ?? null,
        ControlledLikelihoodValue: riskScore?.residualLikelihood ?? null,
        ControlledImpactValue: riskScore?.residualImpact ?? null,
        UncontrolledImpactValue: riskScore?.inherentImpact ?? null,
        UncontrolledLikelihoodValue: riskScore?.inherentLikelihood ?? null,
        UncontrolledLikelihood: getLikelihoodLabel(
          riskScore?.inherentLikelihood ?? null
        ),
        ControlledLikelihood: getLikelihoodLabel(
          riskScore?.residualLikelihood ?? null
        ),
        ControlledImpact: getImpactLabel(riskScore?.residualImpact ?? null),
        UncontrolledImpact: getImpactLabel(riskScore?.inherentImpact ?? null),
        CustomAttributeData: {
          ...(d.CustomAttributeData || {}),
          ...getAssessmentResultCustomAttributeData(d.assessmentResults),
        },
        Owner: d.owners,
        OwnerName: d.owners,
        SequentialIdLabel: d.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Risk, d.SequentialId)
          : '',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        ImpactPerformanceScore: getImpactPerformanceScoreWithAppetiteArray(
          d.Id,
          d.impactRatings,
          impactAppetites
        ),
        LatestRatingDate: d.scheduleState?.LatestDate ?? '-',
        NextTestDate: d.scheduleState?.DueDate ?? '-',
        NextTestOverdueDate: d.scheduleState?.OverdueDate ?? '-',
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
        TestFrequency:
          getCommonLookupByValue('frequency', d.schedule?.Frequency)?.label ??
          null,

        UncontrolledRatingHistory: getRatingHistory(
          d.assessmentResults ?? [],
          Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
        ),
        ControlledRatingHistory: getRatingHistory(
          d.assessmentResults ?? [],
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        ),
        UncontrolledRatingTrend: impactsEnabled
          ? getImpactRatingsTrend(d.impactRatingsForTrend ?? [])
          : getRatingTrend(
              d.assessmentResults ?? [],
              Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
            ),
        UncontrolledRatingTrendLabelled:
          getRatingTrendLabel(
            impactsEnabled
              ? getImpactRatingsTrend(d.impactRatingsForTrend ?? [])
              : getRatingTrend(
                  d.assessmentResults ?? [],
                  Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
                )
          ) || '-',
        ControlledRatingTrend: impactsEnabled
          ? getImpactRatingsTrend(d.impactRatingsForTrend ?? [])
          : getRatingTrend(
              d.assessmentResults ?? [],
              Risk_Assessment_Result_Control_Type_Enum.Controlled
            ),
        ControlledRatingTrendLabelled:
          getRatingTrendLabel(
            impactsEnabled
              ? getImpactRatingsTrend(d.impactRatingsForTrend ?? [])
              : getRatingTrend(
                  d.assessmentResults ?? [],
                  Risk_Assessment_Result_Control_Type_Enum.Controlled
                )
          ) || '-',
        Entity: d.enterpriseRiskInstance?.entity?.Name ?? '-',
        EnterpriseRiskLabelled: d.enterpriseRiskInstance?.enterpriseRisk
          ? i18n.format(tt('enterprise_one'), 'capitalize')
          : i18n.format(tt('legal_entity_one'), 'capitalize'),
      };
    });
  }, [
    records,
    riskScores,
    posture,
    impactsEnabled,
    riskScoreFormatters,
    getAppetiteLabel,
    getAppetitePerformanceByValue,
    getRatingTrendLabel,
    getLabelTestScheduleStatus,
    getImpactLabel,
    getLikelihoodLabel,
    getCommonLookupByValue,
    impactAppetites,
    tt,
  ]);
};

const getImpactPerformanceScoreWithAppetiteArray = (
  Id: string,
  impactRatings: RiskFields['impactRatings'],
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined
) =>
  impactRatings.reduce((previous, impactRating) => {
    const impactAppetite = impactAppetites?.find(
      (ia) => ia.Id === impactRating.ImpactId
    );
    const impactAppetiteForRisk = impactAppetite?.appetites.find((a) =>
      a?.parents.find((p) => p.risk?.Id === Id)
    );
    if (_.isNil(impactAppetiteForRisk?.ImpactAppetite)) {
      return previous;
    }

    const score = getImpactPerformanceScore(
      impactRating.Rating,
      impactAppetiteForRisk?.ImpactAppetite
    );

    return previous + (score || 0);
  }, 0);

const getRatingHistory = (
  assessmentResults: RiskFields['assessmentResults'],
  controlType: Risk_Assessment_Result_Control_Type_Enum
) =>
  (assessmentResults ?? [])
    .filter(
      (c) =>
        c.riskAssessmentResult &&
        c.riskAssessmentResult.ControlType === controlType
    )
    .slice(1, 7)
    .map((c) => ({
      rating: c.riskAssessmentResult!.Rating ?? 0,
      likelihood: c.riskAssessmentResult!.Likelihood ?? null,
      impact: c.riskAssessmentResult!.Impact ?? null,
      id: c.riskAssessmentResult!.Id ?? '-',
      testDate: c.riskAssessmentResult!.TestDate ?? '-',
    }));

/**
 * Calculate trend by comparing the first two ratings for a given control type
 */
const getRatingTrend = (
  assessmentResults: RiskFields['assessmentResults'],
  controlType: Risk_Assessment_Result_Control_Type_Enum
) => {
  const filteredResults = (assessmentResults ?? []).filter(
    (c) =>
      c.riskAssessmentResult &&
      c.riskAssessmentResult.ControlType === controlType
  );

  if (filteredResults.length < 2) {
    return null;
  }

  const currentRating = filteredResults[0]?.riskAssessmentResult?.Rating;
  const previousRating = filteredResults[1]?.riskAssessmentResult?.Rating;

  return calculateTrend(currentRating, previousRating);
};

/**
 * Calculate trend from impact ratings (used when impacts feature is enabled).
 * Compares the average rating of the most recent impact ratings against the previous set.
 * Impact ratings are ordered by TestDate desc, so we compare the sum of the first N ratings
 * against the sum of the next N ratings (where N is the number of distinct impacts).
 */
const getImpactRatingsTrend = (
  impactRatingsForTrend: NonNullable<RiskFields['impactRatingsForTrend']>
): TrendIndicator | null => {
  if (impactRatingsForTrend.length < 2) {
    return null;
  }

  // Group ratings by ImpactId to find ratings per impact
  const ratingsByImpact = new Map<string, typeof impactRatingsForTrend>();
  for (const rating of impactRatingsForTrend) {
    const existing = ratingsByImpact.get(rating.ImpactId) ?? [];
    existing.push(rating);
    ratingsByImpact.set(rating.ImpactId, existing);
  }

  // Check if we have at least 2 ratings for at least one impact
  const ratingGroups = Array.from(ratingsByImpact.values());
  const hasEnoughData = ratingGroups.some((ratings) => ratings.length >= 2);

  if (!hasEnoughData) {
    return null;
  }

  // Calculate trend based on sum of all current vs previous ratings
  // For each impact, get the latest and second latest rating
  let currentSum = 0;
  let previousSum = 0;
  let pairsCompared = 0;

  for (const ratings of ratingGroups) {
    if (ratings.length >= 2) {
      const currentRating = ratings[0]?.Rating;
      const previousRating = ratings[1]?.Rating;
      if (currentRating != null && previousRating != null) {
        currentSum += currentRating;
        previousSum += previousRating;
        pairsCompared++;
      }
    }
  }

  if (pairsCompared === 0) {
    return null;
  }

  return calculateTrend(currentSum, previousSum);
};

/**
 * Merges the latest inherent/residual assessment result's CustomAttributeData
 * into the risk record with prefixed keys to avoid collisions.
 */
const getAssessmentResultCustomAttributeData = (
  assessmentResults: RiskFields['assessmentResults']
): JSONObject => {
  const result: JSONObject = {};

  // assessmentResults are ordered by TestDate desc_nulls_last, then CreatedAtTimestamp desc_nulls_last
  const latestUncontrolled = assessmentResults?.find(
    (ar) =>
      ar.riskAssessmentResult?.ControlType ===
      Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
  )?.riskAssessmentResult;

  const latestControlled = assessmentResults?.find(
    (ar) =>
      ar.riskAssessmentResult?.ControlType ===
      Risk_Assessment_Result_Control_Type_Enum.Controlled
  )?.riskAssessmentResult;

  if (latestUncontrolled?.CustomAttributeData) {
    for (const [key, value] of Object.entries(
      latestUncontrolled.CustomAttributeData
    )) {
      result[`uncontrolled__${key}`] = value as JSONObject[string];
    }
  }

  if (latestControlled?.CustomAttributeData) {
    for (const [key, value] of Object.entries(
      latestControlled.CustomAttributeData
    )) {
      result[`controlled__${key}`] = value as JSONObject[string];
    }
  }

  return result;
};
