import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';
import { UNRATED } from 'src/pages/controls/lookupData';

import Link from '@/components/link';
import { useRiskScore } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { internalAuditReportDetailsUrl } from '@/utils/urls';

import type {
  InternalAuditRiskAssessmentResultFlatFields,
  InternalAuditRiskAssessmentResultRegisterFields,
} from './types';
import { useInternalAuditRatingLabelledFields } from './useInternalAuditRatingLabelledFields';

const useGetFieldConfig = (
  onOpenResult: (id: string) => void,
  riskId: string
): TableFields<InternalAuditRiskAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
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
        header: rt('columns.InternalAuditReportTitle'),
        cell: (item) =>
          item.parents.find((p) => p.internalAuditReport)
            ?.internalAuditReport ? (
            <Link
              variant={'secondary'}
              href={internalAuditReportDetailsUrl(
                item.parents.find((p) => p.internalAuditReport)!
                  .internalAuditReport!.Id
              )}
            >
              {
                item.parents.find((p) => p.internalAuditReport)
                  ?.internalAuditReport?.Title
              }
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
        header: rt('columns.InternalAuditReportStatus'),
        cell: (item) => {
          const status = item.parents.find((p) => p.internalAuditReport)
            ?.internalAuditReport?.Status;

          return <SimpleRatingBadge rating={statusGetByValue(status)} />;
        },
      },
      CompletionDate: dateColumnFromConfig({
        header: { header: at('columns.CompletionDate') },
        dateField: 'ActualCompletionDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: { header: at('columns.NextTestDate') },
        dateField: 'NextTestDate',
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

const useGetInternalAuditRatingTableProps = (
  riskId: string,
  onOpenResult: (id: string) => void,
  records: InternalAuditRiskAssessmentResultFlatFields[] | undefined
): UseGetTablePropsOptions<InternalAuditRiskAssessmentResultRegisterFields> => {
  const labelledFields = useInternalAuditRatingLabelledFields(riskId, records);
  const fields = useGetFieldConfig(onOpenResult, riskId);

  return {
    customAttributeFormIds: [
      'risk_controlled_internal_audit_result',
      'risk_uncontrolled_internal_audit_result',
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
    preferencesStorageKey: 'InternalAuditRiskRatingRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  riskId: string,
  onOpenResult: (id: string) => void,
  records: InternalAuditRiskAssessmentResultFlatFields[] | undefined
): TablePropsWithActions<InternalAuditRiskAssessmentResultRegisterFields> => {
  const props = useGetInternalAuditRatingTableProps(
    riskId,
    onOpenResult,
    records
  );

  return useGetTablePropsWithoutUrlHash(props);
};
