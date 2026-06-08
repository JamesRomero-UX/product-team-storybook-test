import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';
import { UNRATED } from 'src/pages/controls/lookupData';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { useRiskScore } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type {
  RiskAssessmentResultFlatFields,
  RiskAssessmentResultRegisterFields,
} from './types';
import { useRiskRatingLabelledFields } from './useRiskRatingLabelledFields';

const useGetFieldConfig = (
  onOpenResult: (id: string) => void,
  riskId: string
): TableFields<RiskAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'assessments',
  });
  const { t: ar } = useTranslation(['common'], {
    keyPrefix: 'assessmentResults',
  });
  const { t: rt } = useTranslation(['common'], {
    keyPrefix: 'ratings',
  });
  const getControlTypeLabel = useControlTypeLabel();
  const riskScores = useRiskScore(riskId);
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();

  return useMemo(
    () => ({
      TestDate: dateColumnFromConfig({
        header: { header: rt('columns.TestDate') },
        dateField: 'TestDate',
        onClick: (item) => onOpenResult(item.Id),
      }),
      ParentTitle: {
        header: rt('columns.AssessmentTitle'),
        cell: (item) =>
          item.parents.find((p) => p.assessment)?.assessment ? (
            <Link
              isRelativeUrl={true}
              variant={'secondary'}
              href={item.parents.find((p) => p.assessment)?.assessment?.Id}
            >
              {item.parents.find((p) => p.assessment)?.assessment?.Title}
            </Link>
          ) : (
            '-'
          ),
        isRowHeader: true,
      },
      ControlTypeLabelled: {
        header: ar('fields.ControlType'),
        cell: (item) => getControlTypeLabel(item.ControlType),
        sortingField: 'ControlType',
      },
      RatingLabelled: {
        header: rt('columns.Rating'),
        sortingField: 'Rating',
        cell: (item) => {
          if (!riskScores.showScore) {
            const resolved = resolveRiskRating({
              likelihood: item.Likelihood,
              impact: item.Impact,
              controlType: item.ControlType,
              rating: item.Rating,
            });

            return <SimpleRatingBadge rating={resolved ?? UNRATED} />;
          }

          return '-';
        },
      },
      ImpactLabelled: {
        header: rt('columns.Impact'),
        cell: (item) =>
          item.Impact ? (
            <SimpleRatingBadge rating={resolveImpact(item.Impact) ?? UNRATED} />
          ) : (
            '-'
          ),
      },
      LikelihoodLabelled: {
        header: rt('columns.Likelihood'),
        cell: (item) =>
          item.Likelihood ? (
            <SimpleRatingBadge
              rating={resolveLikelihood(item.Likelihood) ?? UNRATED}
            />
          ) : (
            '-'
          ),
      },
      StatusLabelled: {
        header: rt('columns.AssessmentStatus'),
        cell: (item) => {
          const status = item.parents.find((p) => p.assessment)?.assessment
            ?.Status;

          return <SimpleRatingBadge rating={statusGetByValue(status)} />;
        },
      },
      CompletionDate: dateColumnFromConfig({
        header: { header: at('columns.CompletionDate') },
        dateField: 'ActualCompletionDate',
      }),
    }),
    [
      ar,
      at,
      getControlTypeLabel,
      onOpenResult,
      resolveImpact,
      resolveLikelihood,
      resolveRiskRating,
      riskScores.showScore,
      rt,
      statusGetByValue,
    ]
  );
};

const useGetRiskRatingTableProps = (
  risk: ObjectWithContributors,
  onOpenResult: (id: string) => void,
  records: RiskAssessmentResultFlatFields[] | undefined
): UseGetTablePropsOptions<RiskAssessmentResultRegisterFields> => {
  const labelledFields = useRiskRatingLabelledFields(risk.Id, records);
  const fields = useGetFieldConfig(onOpenResult, risk.Id);

  return {
    customAttributeFormIds: [
      'uncontrolled_risk_assessment_result',
      'controlled_risk_assessment_result',
    ],
    data: labelledFields,
    enableFiltering: true,
    entityLabel: 'rating',
    defaultSortingState: {
      sortingColumn: 'TestDate',
      sortingDirection: 'desc',
    },
    initialColumns: [
      'TestDate',
      'ParentTitle',
      'ControlTypeLabelled',
      'RatingLabelled',
      'ImpactLabelled',
      'LikelihoodLabelled',
      'StatusLabelled',
    ],
    preferencesStorageKey: 'RiskRatingRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  risk: ObjectWithContributors,
  onOpenResult: (id: string) => void,
  onAddRating: () => void,
  records: RiskAssessmentResultFlatFields[] | undefined
): TablePropsWithActions<RiskAssessmentResultRegisterFields> => {
  const { t } = useTranslation(['common']);
  const props = useGetRiskRatingTableProps(risk, onOpenResult, records);

  return {
    ...useGetTableProps(props),
    empty: (
      <EmptyEntityCollection
        entityLabel={t('rating')}
        action={
          <Permission
            permission={'insert:risk_assessment_result'}
            parentObject={risk}
          >
            <Button formAction={'none'} onClick={onAddRating}>
              {t('assessments.add_rating_button')}
            </Button>
          </Permission>
        }
      />
    ),
  };
};
