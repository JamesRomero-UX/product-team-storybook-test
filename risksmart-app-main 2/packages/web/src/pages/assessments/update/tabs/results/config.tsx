import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { assessmentResultsEditUrl } from '@/utils/urls';

import type {
  AssessmentResultFields,
  AssessmentResultRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AssessmentResultRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.columns',
  });
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const getFormatters = useRiskScoreFormatters();
  const ratingFns = {
    document_assessment_result: (d: AssessmentResultFields) =>
      getByResultValue(d.Rating),
    obligation_assessment_result: (d: AssessmentResultFields) =>
      getByResultValue(d.Rating),
    test_result: (d: AssessmentResultFields) =>
      getEffectivenessByValue(d.OverallEffectiveness),
  };

  return {
    TypeLabelled: {
      header: t('Type'),
      cell: (item) => {
        return (
          <Link
            variant={'secondary'}
            href={assessmentResultsEditUrl(item.AssessmentId, item.Id)}
          >
            {item.TypeLabelled}
          </Link>
        );
      },
      isRowHeader: true,
    },
    ParentTitle: {
      header: t('Item'),
    },
    RatingLabelled: {
      header: t('Result'),
      cell: (item) => {
        if (item.typename === 'risk_assessment_result') {
          const { getInherentRatingBadge, getResidualRatingBadge } =
            getFormatters({
              inherentRating: item.Rating,
              inherentLikelihood: item.Likelihood,
              inherentImpact: item.Impact,
              residualRating: item.Rating,
              residualLikelihood: item.Likelihood,
              residualImpact: item.Impact,
            });
          if (
            item.ControlType ===
            Risk_Assessment_Result_Control_Type_Enum.Controlled
          ) {
            return getResidualRatingBadge();
          }

          return getInherentRatingBadge();
        }

        return (
          <SimpleRatingBadge
            rating={ratingFns[item.typename as keyof typeof ratingFns](item)}
          />
        );
      },
      sortingField: 'Rating',
    },
    TestDate: dateColumnFromConfig({
      header: { header: t('TestDate') },
      dateField: 'TestDate',
    }),
    Rationale: {
      header: t('Rationale'),
    },
  };
};

export const useGetCollectionStatelessTableProps = (
  records: AssessmentResultFields[] | undefined
): TablePropsWithActions<AssessmentResultRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const labelledFields = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useGetTablePropsWithoutUrlHash({
    customAttributeFormIds: [],
    data: labelledFields,
    entityLabel: at('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AssessmentResults-Preferences',
    enableFiltering: true,
    initialColumns: [
      'TestDate',
      'ParentTitle',
      'TypeLabelled',
      'RatingLabelled',
    ],
    fields,
  });
};
