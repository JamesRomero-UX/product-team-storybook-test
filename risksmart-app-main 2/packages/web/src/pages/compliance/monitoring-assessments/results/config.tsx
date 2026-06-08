import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useAggregation } from 'src/hooks/useAggregation';

import Link from '@/components/link';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import {
  complianceMonitoringAssessmentDetailsUrl,
  obligationDetailsUrl,
  policyDetailsUrl,
  riskDetailsUrl,
} from '@/utils/urls';

import type {
  ComplianceMonitoringAssessmentResultFields,
  ComplianceMonitoringAssessmentResultRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const getParentLink = (
  item: ComplianceMonitoringAssessmentResultRegisterFields
) => {
  const originalItem = item?.originalResult;
  switch (originalItem.__typename) {
    case 'document_second_line_result':
      if (originalItem?.documents?.[0]?.document?.Id) {
        return policyDetailsUrl(originalItem?.documents?.[0]?.document?.Id);
      }
      break;
    case 'obligation_second_line_result':
      if (originalItem?.obligations?.[0]?.obligation?.Id) {
        return obligationDetailsUrl(
          originalItem?.obligations?.[0]?.obligation?.Id
        );
      }
      break;
    case 'risk_uncontrolled_second_line_result':
    case 'risk_controlled_second_line_result':
      if (originalItem?.risks?.[0]?.risk?.Id) {
        return riskDetailsUrl(originalItem?.risks?.[0]?.risk?.Id);
      }
      break;
  }

  return null;
};

const useGetFieldConfig = (
  handleOpenRating: (id: string) => void
): TableFields<ComplianceMonitoringAssessmentResultRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.columns',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: `complianceMonitoringAssessment.fields`,
  });
  const { t: tt } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();
  const { riskModel } = useAggregation();

  const ratingFns = {
    document_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => getByResultValue(d.Rating),
    obligation_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => getByResultValue(d.Rating),
    control_test_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => getEffectivenessByValue(d.OverallEffectiveness),
    risk_controlled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) =>
      resolveRiskRating({
        likelihood: d.Likelihood,
        impact: d.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
        rating: d.Rating,
      }),
    risk_uncontrolled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) =>
      resolveRiskRating({
        likelihood: d.Likelihood,
        impact: d.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
        rating: d.Rating,
      }),
  };

  const likelihoodFns = {
    document_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    obligation_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    control_test_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    risk_uncontrolled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => resolveLikelihood(d.Likelihood),
    risk_controlled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => resolveLikelihood(d.Likelihood),
  };

  const impactFns = {
    document_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    obligation_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    control_test_second_line_result: (
      _d: ComplianceMonitoringAssessmentResultFields
    ) => null,
    risk_uncontrolled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => resolveImpact(d.Impact),
    risk_controlled_second_line_result: (
      d: ComplianceMonitoringAssessmentResultFields
    ) => resolveImpact(d.Impact),
  };

  return {
    TestDate: dateColumnFromConfig({
      header: {
        header: t('TestDate'),
      },
      dateField: 'TestDate',
      onClick: (item: ComplianceMonitoringAssessmentResultRegisterFields) =>
        handleOpenRating(item.Id as string),
    }),
    AssessmentTitle: {
      header: t('Title'),
      isRowHeader: true,
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        const complianceMonitoringAssessment =
          item.originalResult.complianceMonitoringAssessments.find(
            (a) => a.complianceMonitoringAssessment
          )?.complianceMonitoringAssessment;

        return complianceMonitoringAssessment ? (
          <Link
            href={complianceMonitoringAssessmentDetailsUrl(
              complianceMonitoringAssessment.Id
            )}
          >
            {complianceMonitoringAssessment.Title}
          </Link>
        ) : (
          '-'
        );
      },
    },
    TypeLabelled: {
      header: t('Type'),
    },
    ParentTitle: {
      header: t('Item'),
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        const link = getParentLink(item);

        return link ? (
          <Link href={link}>{item.ParentTitle}</Link>
        ) : (
          <>{item.ParentTitle}</>
        );
      },
    },
    RatingLabelled: {
      header: t('Result'),
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        const isRiskAssessmentResult =
          item.originalResult.__typename ===
            'risk_controlled_second_line_result' ||
          item.originalResult.__typename ===
            'risk_uncontrolled_second_line_result';
        if (
          isRiskAssessmentResult &&
          riskModel === 'control_effectiveness_averages'
        ) {
          return '-';
        }

        return (
          <SimpleRatingBadge
            rating={ratingFns[
              item.originalResult.__typename as keyof typeof ratingFns
            ](item.originalResult)}
          />
        );
      },
      sortingField: 'Rating',
    },
    ImpactLabelled: {
      header: t('Impact'),
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        const isRiskAssessmentResult =
          item.originalResult.__typename ===
            'risk_controlled_second_line_result' ||
          item.originalResult.__typename ===
            'risk_uncontrolled_second_line_result';
        if (isRiskAssessmentResult) {
          const impact = impactFns[
            item.originalResult.__typename as keyof typeof impactFns
          ](item.originalResult);

          if (impact) {
            return <SimpleRatingBadge rating={impact} />;
          }
        }

        return <>{'-'}</>;
      },
    },
    LikelihoodLabelled: {
      header: t('Likelihood'),
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        const isRiskAssessmentResult =
          item.originalResult.__typename ===
            'risk_controlled_second_line_result' ||
          item.originalResult.__typename ===
            'risk_uncontrolled_second_line_result';
        if (isRiskAssessmentResult) {
          const likelihood = likelihoodFns[
            item.originalResult.__typename as keyof typeof likelihoodFns
          ](item.originalResult);

          if (likelihood) {
            return <SimpleRatingBadge rating={likelihood} />;
          }
        }

        return '-';
      },
    },
    StartDate: dateColumnFromConfig({
      header: {
        header: t('StartDate'),
      },
      dateField: 'StartDate',
    }),
    ActualCompletionDate: dateColumnFromConfig({
      header: {
        header: t('CompletionDate'),
      },
      dateField: 'ActualCompletionDate',
    }),
    CompletedByUser: {
      header: t('CompletionBy'),
    },
    Rationale: {
      header: t('Rationale'),
    },
    StatusLabelled: {
      header: st('Status'),
      cell: (item: ComplianceMonitoringAssessmentResultRegisterFields) => {
        return <SimpleRatingBadge rating={statusGetByValue(item.Status)} />;
      },
    },
    Id: {
      header: tt('guid'),
    },
  };
};

export const useGetCollectionTableProps = (
  records: ComplianceMonitoringAssessmentResultFields[] | undefined,
  handleOpenRating: (id: string) => void
): TablePropsWithActions<ComplianceMonitoringAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const fields = useGetFieldConfig(handleOpenRating);
  const labelledFields = useLabelledFields(records);

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'complianceMonitoringAssessmentResultRegister',
    data: labelledFields,
    entityLabel: at('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey:
      'ComplianceMonitoringAssessmentResultRegister-Preferences',
    enableFiltering: true,
    initialColumns: [
      'TestDate',
      'AssessmentTitle',
      'ParentTitle',
      'TypeLabelled',
      'ImpactLabelled',
      'LikelihoodLabelled',
      'RatingLabelled',
      'StatusLabelled',
    ],
    fields,
  });
};
