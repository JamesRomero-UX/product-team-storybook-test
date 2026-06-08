import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { complianceMonitoringAssessmentDetailsUrl } from '@/utils/urls';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  ComplianceObligationAssessmentResultFlatFields,
  ComplianceObligationAssessmentResultRegisterFields,
} from './types';
import { useComplianceMonitoringObligationRatingLabelledFields } from './useComplianceMonitoringObligationRatingLabelledFields';

const useGetFieldConfig = (
  onOpenResult: (id: string) => void
): TableFields<ComplianceObligationAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'complianceMonitoringAssessment',
  });

  const { getByValue: getResultByValue } = useRating('performance_result');
  const { getByValue: statusGetByValue } = useRating('assessment_status');

  return useMemo(
    () => ({
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'obligation_second_line_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
        onClick: (item) => onOpenResult(item.Id),
      }),
      Title: {
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) =>
          item.parents.find((p) => p.complianceMonitoringAssessment)
            ?.complianceMonitoringAssessment ? (
            <Link
              variant={'secondary'}
              href={complianceMonitoringAssessmentDetailsUrl(
                item.parents.find((p) => p.complianceMonitoringAssessment)!
                  .complianceMonitoringAssessment!.Id
              )}
            >
              {
                item.parents.find((p) => p.complianceMonitoringAssessment)
                  ?.complianceMonitoringAssessment?.Title
              }
            </Link>
          ) : (
            '-'
          ),
        sortingField: 'Title',
      },
      Result: {
        formId: 'obligation_second_line_result',
        fieldId: 'Rating',
        cell: (item) => {
          const result = getResultByValue(item.Rating);

          return <SimpleRatingBadge rating={result ?? UNRATED} />;
        },
        sortingField: 'ResultValue',
      },
      Status: {
        header: at('columns.Status'),
        cell: (item) => {
          return <SimpleRatingBadge rating={statusGetByValue(item.Status)} />;
        },
        sortingField: 'Status',
      },
      CompletionDate: dateColumnFromConfig({
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'ActualCompletionDate',
          includeFromTypePostfix: true,
        },
        dateField: 'CompletionDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'NextTestDate',
          includeFromTypePostfix: true,
        },
        dateField: 'NextTestDate',
      }),
    }),
    [at, getResultByValue, onOpenResult, statusGetByValue]
  );
};

const useGetObligationRatingTableProps = (
  records: ComplianceObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void
): UseGetTablePropsOptions<ComplianceObligationAssessmentResultRegisterFields> => {
  const labelledFields =
    useComplianceMonitoringObligationRatingLabelledFields(records);
  const fields = useGetFieldConfig(onOpenResult);

  return {
    customAttributeFormIds: ['obligation_second_line_result'],
    data: labelledFields,
    enableFiltering: true,
    entityLabel: 'rating',
    defaultSortingState: {
      sortingColumn: 'TestDate',
      sortingDirection: 'desc',
    },
    initialColumns: [
      'TestDate',
      'Title',
      'Result',
      'Status',
      'CompletionDate',
      'NextTestDate',
    ],
    preferencesStorageKey:
      'ComplianceMonitoringObligationRatingRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  records: ComplianceObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void
): TablePropsWithActions<ComplianceObligationAssessmentResultRegisterFields> => {
  const props = useGetObligationRatingTableProps(records, onOpenResult);

  return useGetTablePropsWithoutUrlHash(props);
};
