import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';

import { useRiskScoreFormatters } from '@/hooks/useRiskScore';

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
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const getFormatters = useRiskScoreFormatters();
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const labelledFields = useMemo<
    AssessmentResultRegisterFields[] | undefined
  >(() => {
    const ratingFns = {
      document_assessment_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      obligation_assessment_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      test_result: (d: AssessmentResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_assessment_result: (d: AssessmentResultFields) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (rating == null || controlType == null) {
          return;
        }

        const { getInherentLabel, getResidualLabel } = getFormatters({
          inherentRating: rating,
          inherentLikelihood: d.Likelihood,
          inherentImpact: d.Impact,
          residualRating: rating,
          residualLikelihood: d.Likelihood,
          residualImpact: d.Impact,
        });

        return {
          label:
            controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
              ? getResidualLabel()
              : getInherentLabel(),
        };
      },
    };

    return records?.map((d) => {
      return {
        ...d,
        TypeLabelled: decorateWithControlType(
          assessmentResultTypes[
            d.typename as keyof typeof assessmentResultTypes
          ],
          getControlTypeLabel,
          d
        ),
        ParentTitle: getParentTitle(d) || '-',
        RatingLabelled:
          ratingFns[d.typename as keyof typeof ratingFns](d)?.label || '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
      };
    });
  }, [
    records,
    assessmentResultTypes,
    getByResultValue,
    getControlTypeLabel,
    getFormatters,
    getEffectivenessByValue,
  ]);

  return labelledFields;
};
