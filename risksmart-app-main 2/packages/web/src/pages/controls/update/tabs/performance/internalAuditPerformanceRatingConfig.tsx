import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type {
  InternalAuditPerformanceFlatFields,
  InternalAuditPerformanceRegisterFields,
} from './types';
import { useInternalAuditPerformanceLabelledFields } from './useInternalAuditPerformanceLabelledFields';

const useGetFieldConfig = (
  onEdit: (item: InternalAuditPerformanceFlatFields) => void
): TableFields<InternalAuditPerformanceRegisterFields> => {
  const { t } = useTranslation(['common']);
  const { getByValue } = useRating('effectiveness');

  return useMemo(
    () => ({
      FriendlyID: {
        header: t('columns.id'),
        cell: (item) => (
          <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
            {getFriendlyId(Parent_Type_Enum.TestResult, item.SequentialId)}
          </Link>
        ),
      },
      Title: {
        formId: 'control_test_internal_audit_result',
        fieldId: 'Title',
        cell: (item) => item.Title,
        sortingField: 'Title',
      },
      InternalAuditReportTitle: {
        formId: 'internal_audit_report',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) =>
          item.parents.find((p) => p.internalAuditReport)
            ?.internalAuditReport ? (
            <Link
              isRelativeUrl={true}
              variant={'secondary'}
              href={
                item.parents.find((p) => p.internalAuditReport)
                  ?.internalAuditReport?.Id
              }
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
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'control_test_internal_audit_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
      }),
      TestTypeLabelled: {
        formId: 'control_test_internal_audit_result',
        fieldId: 'TestType',
        cell: (item) => {
          const testTypeLookup = t('testTypes');
          if (item.TestType) {
            const testTypeLabel =
              testTypeLookup[item.TestType as keyof typeof testTypeLookup];
            if (testTypeLabel) {
              return testTypeLabel;
            }

            return '-';
          }
        },
      },
      OverallEffectivenessLabelled: {
        formId: 'control_test_internal_audit_result',
        fieldId: 'OverallEffectiveness',
        cell: (item) => {
          return (
            <SimpleRatingBadge rating={getByValue(item.OverallEffectiveness)} />
          );
        },
      },
      SubmitterName: {
        formId: 'control_test_internal_audit_result',
        fieldId: 'Submitter',
        cell: (item) => item.SubmitterName || '-',
        sortingField: 'SubmitterName',
      },
    }),
    [getByValue, onEdit, t]
  );
};

const useGetPerformanceTableProps = (
  onEdit: (item: InternalAuditPerformanceFlatFields) => void,
  records: InternalAuditPerformanceFlatFields[] | undefined
): UseGetTablePropsOptions<InternalAuditPerformanceRegisterFields> => {
  const fields = useGetFieldConfig(onEdit);
  const labelledFields = useInternalAuditPerformanceLabelledFields(records);

  return {
    customAttributeFormIds: ['control_test_internal_audit_result'],
    data: labelledFields,
    enableFiltering: true,
    entityLabel: 'rating',
    defaultSortingState: {
      sortingColumn: 'TestDate',
      sortingDirection: 'desc',
    },
    initialColumns: [
      'FriendlyID',
      'Title',
      'TestDate',
      'TestTypeLabelled',
      'OverallEffectivenessLabelled',
      'SubmitterName',
    ],
    preferencesStorageKey:
      'ControlInternalAuditPerformanceRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  onEdit: (item: InternalAuditPerformanceFlatFields) => void,
  records: InternalAuditPerformanceFlatFields[] | undefined
): TablePropsWithActions<InternalAuditPerformanceRegisterFields> => {
  const props = useGetPerformanceTableProps(onEdit, records);

  return useGetTablePropsWithoutUrlHash(props);
};
