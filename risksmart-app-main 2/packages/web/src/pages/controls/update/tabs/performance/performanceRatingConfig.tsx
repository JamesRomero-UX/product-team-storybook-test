import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { PerformanceFlatFields, PerformanceRegisterFields } from './types';
import { usePerformanceLabelledFields } from './usePerformanceLabelledFields';

const useGetFieldConfig = (
  onEdit: (item: PerformanceFlatFields) => void
): TableFields<PerformanceRegisterFields> => {
  const { t } = useTranslation(['common']);
  const { getByValue } = useRating('effectiveness');

  return useMemo<TableFields<PerformanceRegisterFields>>(
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
        formId: 'test_result',
        fieldId: 'Title',
        cell: (item) => item.Title,
        sortingField: 'Title',
      },
      AssessmentTitle: {
        formId: 'assessment',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) =>
          item.assessmentParents.find((p) => p.assessment)?.assessment ? (
            <Link
              isRelativeUrl={true}
              variant={'secondary'}
              href={
                item.assessmentParents.find((p) => p.assessment)?.assessment?.Id
              }
            >
              {
                item.assessmentParents.find((p) => p.assessment)?.assessment
                  ?.Title
              }
            </Link>
          ) : (
            '-'
          ),
        isRowHeader: true,
      },
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'test_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
      }),
      TestTypeLabelled: {
        formId: 'test_result',
        fieldId: 'TestType',
        cell: (item) => {
          const testTypeLookup = t('testTypes');

          if (!item.TestType) {
            return '-';
          }

          const testTypeLabel =
            testTypeLookup[item.TestType as keyof typeof testTypeLookup];

          return testTypeLabel ?? '-';
        },
      },
      OverallEffectivenessLabelled: {
        formId: 'test_result',
        fieldId: 'OverallEffectiveness',
        cell: (item) => {
          return (
            <SimpleRatingBadge rating={getByValue(item.OverallEffectiveness)} />
          );
        },
      },
      SubmitterName: {
        formId: 'test_result',
        fieldId: 'Submitter',
        cell: (item) => item.SubmitterName || '-',
        sortingField: 'SubmitterName',
      },
    }),
    [getByValue, onEdit, t]
  );
};

const useGetPerformanceTableProps = (
  onEdit: (item: PerformanceFlatFields) => void,
  records: PerformanceFlatFields[] | undefined
): UseGetTablePropsOptions<PerformanceRegisterFields> => {
  const fields = useGetFieldConfig(onEdit);
  const labelledFields = usePerformanceLabelledFields(records);

  return {
    customAttributeFormIds: ['test_result'],
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
    preferencesStorageKey: 'ControlPerformanceRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  control: ObjectWithContributors,
  onEdit: (item: PerformanceFlatFields) => void,
  onAddTestResult: () => void,
  records: PerformanceFlatFields[] | undefined
): TablePropsWithActions<PerformanceRegisterFields> => {
  const props = useGetPerformanceTableProps(onEdit, records);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults',
  });

  return {
    ...useGetTableProps(props),
    empty: (
      <EmptyEntityCollection
        entityLabel={st('entity_name')}
        action={
          <Permission permission={'insert:test_result'} parentObject={control}>
            <Button formAction={'none'} onClick={onAddTestResult}>
              {st('add_button')}
            </Button>
          </Permission>
        }
      />
    ),
  };
};
