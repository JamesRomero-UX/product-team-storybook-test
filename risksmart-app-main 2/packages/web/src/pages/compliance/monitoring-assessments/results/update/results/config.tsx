import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { complianceMonitoringAssessmentResultsEditUrl } from '@/utils/urls';

import type {
  SecondLineResultFields,
  SecondLineResultRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<SecondLineResultRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.columns',
  });
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const getFormatters = useRiskScoreFormatters();
  const ratingFns = {
    document_second_line_result: (d: SecondLineResultFields) =>
      getByResultValue(d.Rating),
    obligation_second_line_result: (d: SecondLineResultFields) =>
      getByResultValue(d.Rating),
    control_test_second_line_result: (d: SecondLineResultFields) =>
      getEffectivenessByValue(d.OverallEffectiveness),
  };

  return {
    TypeLabelled: {
      header: t('Type'),
      cell: (item) => {
        return (
          <Link
            variant={'secondary'}
            href={complianceMonitoringAssessmentResultsEditUrl(
              item.ParentId,
              item.Id
            )}
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
        if (
          item.typename === 'risk_controlled_second_line_result' ||
          item.typename === 'risk_uncontrolled_second_line_result'
        ) {
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
  records: SecondLineResultFields[] | undefined
): TablePropsWithActions<SecondLineResultRegisterFields> => {
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
