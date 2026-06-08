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
  ComplianceMonitoringPerformanceFlatFields,
  ComplianceMonitoringPerformanceRegisterFields,
} from './types';
import { useComplianceMonitoringPerformanceLabelledFields } from './useComplianceMonitoringPerformanceLabelledFields';

const useGetFieldConfig = (
  onEdit: (item: ComplianceMonitoringPerformanceFlatFields) => void
): TableFields<ComplianceMonitoringPerformanceRegisterFields> => {
  const { t } = useTranslation(['common']);

  const { getByValue } = useRating('effectiveness');

  return useMemo<TableFields<ComplianceMonitoringPerformanceRegisterFields>>(
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
        formId: 'control_test_second_line_result',
        fieldId: 'Title',
        cell: (item) => item.Title,
        sortingField: 'Title',
      },
      ComplianceMonitoringAssessmentTitle: {
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) =>
          item.parents.find((p) => p.complianceMonitoringAssessment)
            ?.complianceMonitoringAssessment ? (
            <Link
              isRelativeUrl={true}
              variant={'secondary'}
              href={
                item.parents.find((p) => p.complianceMonitoringAssessment)
                  ?.complianceMonitoringAssessment?.Id
              }
            >
              {
                item.parents.find((p) => p.complianceMonitoringAssessment)
                  ?.complianceMonitoringAssessment?.Title
              }
            </Link>
          ) : (
            '-'
          ),
        isRowHeader: true,
      },
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'control_test_second_line_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
      }),
      TestTypeLabelled: {
        formId: 'control_test_second_line_result',
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
        formId: 'control_test_second_line_result',
        fieldId: 'OverallEffectiveness',
        cell: (item) => {
          return (
            <SimpleRatingBadge rating={getByValue(item.OverallEffectiveness)} />
          );
        },
      },
      SubmitterName: {
        formId: 'control_test_second_line_result',
        fieldId: 'Submitter',
        cell: (item) => item.SubmitterName || '-',
        sortingField: 'SubmitterName',
      },
    }),
    [getByValue, onEdit, t]
  );
};

const useGetPerformanceTableProps = (
  onEdit: (item: ComplianceMonitoringPerformanceFlatFields) => void,
  records: ComplianceMonitoringPerformanceFlatFields[] | undefined
): UseGetTablePropsOptions<ComplianceMonitoringPerformanceRegisterFields> => {
  const fields = useGetFieldConfig(onEdit);
  const labelledFields =
    useComplianceMonitoringPerformanceLabelledFields(records);

  return {
    customAttributeFormIds: ['control_test_second_line_result'],
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
      'ControlComplianceMonitoringPerformanceRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  onEdit: (item: ComplianceMonitoringPerformanceFlatFields) => void,
  records: ComplianceMonitoringPerformanceFlatFields[] | undefined
): TablePropsWithActions<ComplianceMonitoringPerformanceRegisterFields> => {
  const props = useGetPerformanceTableProps(onEdit, records);

  return useGetTablePropsWithoutUrlHash(props);
};
