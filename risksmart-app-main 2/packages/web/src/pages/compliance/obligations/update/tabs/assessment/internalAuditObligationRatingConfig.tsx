import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { internalAuditReportDetailsUrl } from '@/utils/urls';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  InternalAuditObligationAssessmentResultFlatFields,
  InternalAuditObligationAssessmentResultRegisterFields,
} from './types';
import { useInternalAuditObligationRatingLabelledFields } from './useInternalAuditObligationRatingLabelledFields';

const useGetFieldConfig = (
  onOpenResult: (id: string) => void
): TableFields<InternalAuditObligationAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });
  const { getByValue: getResultByValue } =
    useInternalAuditRating('performance_result');
  const { getByValue: statusGetByValue } =
    useInternalAuditRating('assessment_status');

  return useMemo(
    () => ({
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'obligation_internal_audit_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
        onClick: (item) => onOpenResult(item.Id),
      }),
      Title: {
        formId: 'internal_audit_report',
        fieldId: 'Title',
        includeFromTypePostfix: true,
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
        sortingField: 'Title',
      },
      Result: {
        formId: 'obligation_internal_audit_result',
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
          formId: 'internal_audit_report',
          fieldId: 'ActualCompletionDate',
          includeFromTypePostfix: true,
        },
        dateField: 'CompletionDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: {
          formId: 'internal_audit_report',
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
  records: InternalAuditObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void
): UseGetTablePropsOptions<InternalAuditObligationAssessmentResultRegisterFields> => {
  const labelledFields =
    useInternalAuditObligationRatingLabelledFields(records);
  const fields = useGetFieldConfig(onOpenResult);

  return {
    customAttributeFormIds: ['obligation_internal_audit_result'],
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
      'InternalAuditObligationRatingRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  records: InternalAuditObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void
): TablePropsWithActions<InternalAuditObligationAssessmentResultRegisterFields> => {
  const props = useGetObligationRatingTableProps(records, onOpenResult);

  return useGetTablePropsWithoutUrlHash(props);
};
