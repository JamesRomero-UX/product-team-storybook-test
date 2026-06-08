import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAggregation } from 'src/hooks/useAggregation';

import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { useControlTypeLabel } from '../forms/useControlTypeLabel';
import { decorateWithControlType, getParentTitle } from './helpers';
import type {
  AssessmentResultFields,
  AssessmentResultRegisterFields,
} from './types';

export const useLabelledFields = (
  records: AssessmentResultFields[] | undefined
) => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const { riskModel } = useAggregation();
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();

  return useMemo<AssessmentResultRegisterFields[] | undefined>(() => {
    const ratingFns = {
      document_assessment_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      obligation_assessment_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      test_result: (d: AssessmentResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_assessment_result: (d: AssessmentResultFields) => {
        const controlType = d.ControlType;
        if (
          controlType == null ||
          riskModel === 'control_effectiveness_averages'
        ) {
          return;
        }

        return resolveRiskRating({
          likelihood: d.Likelihood,
          impact: d.Impact,
          controlType:
            controlType === 'Uncontrolled'
              ? Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
              : Risk_Assessment_Result_Control_Type_Enum.Controlled,
          rating: d.Rating,
        });
      },
    };

    const likelihoodFns = {
      document_assessment_result: (_d: AssessmentResultFields) => null,
      obligation_assessment_result: (_d: AssessmentResultFields) => null,
      test_result: (_d: AssessmentResultFields) => null,
      risk_assessment_result: (d: AssessmentResultFields) =>
        resolveLikelihood(d.Likelihood),
    };

    const impactFns = {
      document_assessment_result: (_d: AssessmentResultFields) => null,
      obligation_assessment_result: (_d: AssessmentResultFields) => null,
      test_result: (_d: AssessmentResultFields) => null,
      risk_assessment_result: (d: AssessmentResultFields) =>
        resolveImpact(d.Impact),
    };

    return records?.map((d) => {
      const assessmentStatus = d.assessments.find((a) => a.assessment)
        ?.assessment?.Status;

      return {
        ...d,
        AssessmentTitle:
          d.assessments.find((a) => a.assessment)?.assessment?.Title || '-',
        TypeLabelled: decorateWithControlType(
          assessmentResultTypes[
            d.__typename as keyof typeof assessmentResultTypes
          ],
          getControlTypeLabel,
          d
        ),
        ParentTitle: getParentTitle(d) || '-',
        RatingLabelled:
          ratingFns[d.__typename as keyof typeof ratingFns](d)?.label || '-',
        ImpactLabelled:
          impactFns[d.__typename as keyof typeof impactFns](d)?.label || '-',
        LikelihoodLabelled:
          likelihoodFns[d.__typename as keyof typeof likelihoodFns](d)?.label ||
          '-',
        StartDate: d.assessments.find((a) => a.assessment)?.assessment
          ?.StartDate,
        ActualCompletionDate: d.assessments.find((a) => a.assessment)
          ?.assessment?.ActualCompletionDate,
        CompletedByUser:
          d.assessments.find((a) => a.assessment)?.assessment?.completedByUser
            ?.FriendlyName || '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
        Status: assessmentStatus ?? '-',
        StatusLabelled: assessmentStatus
          ? getStatusLabel(assessmentStatus)
          : '-',
        originalResult: d,
        ResultType: d.__typename!,
      };
    });
  }, [
    records,
    getByResultValue,
    getEffectivenessByValue,
    riskModel,
    resolveRiskRating,
    resolveLikelihood,
    resolveImpact,
    assessmentResultTypes,
    getControlTypeLabel,
    getStatusLabel,
  ]);
};
