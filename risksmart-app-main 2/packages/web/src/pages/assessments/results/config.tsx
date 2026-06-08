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
  assessmentDetailsUrl,
  obligationDetailsUrl,
  policyDetailsUrl,
  riskDetailsUrl,
} from '@/utils/urls';

import type {
  AssessmentResultFields,
  AssessmentResultRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const getParentLink = (item: AssessmentResultRegisterFields) => {
  const originalItem = item?.originalResult;
  switch (originalItem.__typename) {
    case 'document_assessment_result':
      if (originalItem?.documents?.[0]?.document?.Id) {
        return policyDetailsUrl(originalItem?.documents?.[0]?.document?.Id);
      }
      break;
    case 'obligation_assessment_result':
      if (originalItem?.obligations?.[0]?.obligation?.Id) {
        return obligationDetailsUrl(
          originalItem?.obligations?.[0]?.obligation?.Id
        );
      }
      break;
    case 'risk_assessment_result':
      if (originalItem?.risks?.[0]?.risk?.Id) {
        return riskDetailsUrl(originalItem?.risks?.[0]?.risk?.Id);
      }
      break;
  }

  return null;
};

const useGetFieldConfig = (
  handleOpenRating: (id: AssessmentResultRegisterFields) => void
): TableFields<AssessmentResultRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.columns',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: `assessments.fields`,
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
    document_assessment_result: (d: AssessmentResultFields) =>
      getByResultValue(d.Rating),
    obligation_assessment_result: (d: AssessmentResultFields) =>
      getByResultValue(d.Rating),
    test_result: (d: AssessmentResultFields) =>
      getEffectivenessByValue(d.OverallEffectiveness),
    risk_assessment_result: (d: AssessmentResultFields) =>
      resolveRiskRating({
        likelihood: d.Likelihood,
        impact: d.Impact,
        controlType:
          d.ControlType === 'Uncontrolled'
            ? Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
            : Risk_Assessment_Result_Control_Type_Enum.Controlled,
        rating: d.Rating,
      }),
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

  return {
    TestDate: dateColumnFromConfig({
      header: { header: t('TestDate') },
      dateField: 'TestDate',
      onClick: handleOpenRating,
    }),
    AssessmentTitle: {
      header: t('Title'),
      isRowHeader: true,
      cell: (item: AssessmentResultRegisterFields) => {
        const assessment = item.originalResult.assessments.find(
          (a) => a.assessment
        )?.assessment;

        return assessment ? (
          <Link href={assessmentDetailsUrl(assessment.Id)}>
            {assessment.Title}
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
      cell: (item: AssessmentResultRegisterFields) => {
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
      cell: (item: AssessmentResultRegisterFields) => {
        if (
          item.originalResult.__typename === 'risk_assessment_result' &&
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
      cell: (item: AssessmentResultRegisterFields) => {
        if (item.originalResult.__typename === 'risk_assessment_result') {
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
      cell: (item: AssessmentResultRegisterFields) => {
        if (item.originalResult.__typename === 'risk_assessment_result') {
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
      header: { header: t('StartDate') },
      dateField: 'StartDate',
    }),
    ActualCompletionDate: dateColumnFromConfig({
      header: { header: t('CompletionDate') },
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
      cell: (item: AssessmentResultRegisterFields) => {
        return <SimpleRatingBadge rating={statusGetByValue(item.Status)} />;
      },
    },
    Id: {
      header: tt('guid'),
    },
  };
};

export const useGetCollectionTableProps = (
  records: AssessmentResultFields[] | undefined,
  handleOpenRating: (id: AssessmentResultRegisterFields) => void
): TablePropsWithActions<AssessmentResultRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const fields = useGetFieldConfig(handleOpenRating);
  const labelledFields = useLabelledFields(records);

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'assessmentResultRegister',
    data: labelledFields,
    entityLabel: at('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AssessmentResultRegister-Preferences',
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
