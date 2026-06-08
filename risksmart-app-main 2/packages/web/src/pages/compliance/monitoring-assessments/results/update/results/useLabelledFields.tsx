import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';

import { useRiskScoreFormatters } from '@/hooks/useRiskScore';

import { decorateWithControlType, getParentTitle } from './helpers';
import type {
  SecondLineResultFields,
  SecondLineResultRegisterFields,
} from './types';

export const useLabelledFields = (
  records: SecondLineResultFields[] | undefined
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
    SecondLineResultRegisterFields[] | undefined
  >(() => {
    const ratingFns = {
      document_second_line_result: (d: SecondLineResultFields) =>
        getByResultValue(d.Rating),
      obligation_second_line_result: (d: SecondLineResultFields) =>
        getByResultValue(d.Rating),
      control_test_second_line_result: (d: SecondLineResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_uncontrolled_second_line_result: (d: SecondLineResultFields) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (rating == null || controlType == null) {
          return;
        }

        const { getInherentLabel } = getFormatters({
          inherentRating: rating,
          inherentLikelihood: d.Likelihood,
          inherentImpact: d.Impact,
        });

        return {
          label: getInherentLabel(),
        };
      },

      risk_controlled_second_line_result: (d: SecondLineResultFields) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (rating == null || controlType == null) {
          return;
        }

        const { getResidualLabel } = getFormatters({
          residualRating: rating,
          residualLikelihood: d.Likelihood,
          residualImpact: d.Impact,
        });

        return {
          label: getResidualLabel(),
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
