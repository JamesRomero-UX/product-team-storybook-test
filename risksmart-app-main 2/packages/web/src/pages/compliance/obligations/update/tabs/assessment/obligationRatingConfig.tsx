import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  ObligationAssessmentResultFlatFields,
  ObligationAssessmentResultRegisterFields,
} from './types';
import { useObligationRatingLabelledFields } from './useObligationRatingLabelledFields';

const useGetFieldConfig = (
  onOpenResult: (id: string) => void
): TableFields<ObligationAssessmentResultRegisterFields> => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'assessments',
  });

  const { getByValue: getResultByValue } = useRating('performance_result');
  const { getByValue: statusGetByValue } = useRating('assessment_status');

  return useMemo(
    () => ({
      TestDate: dateColumnFromConfig({
        header: {
          formId: 'obligation_assessment_result',
          fieldId: 'TestDate',
        },
        dateField: 'TestDate',
        onClick: (item) => onOpenResult(item.Id),
      }),
      Title: {
        formId: 'assessment',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) => (
          <Link variant={'secondary'} href={item.LinkedAssessmentId}>
            {item.Title}
          </Link>
        ),
        sortingField: 'Title',
        isRowHeader: true,
      },
      Result: {
        formId: 'obligation_assessment_result',
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
          formId: 'assessment',
          fieldId: 'ActualCompletionDate',
          includeFromTypePostfix: true,
        },
        dateField: 'CompletionDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: {
          formId: 'assessment',
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
  records: ObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void
): UseGetTablePropsOptions<ObligationAssessmentResultRegisterFields> => {
  const labelledFields = useObligationRatingLabelledFields(records);
  const fields = useGetFieldConfig(onOpenResult);

  return {
    customAttributeFormIds: ['obligation_assessment_result'],
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
    preferencesStorageKey: 'ObligationRatingRegisterTable-Preferences',
    fields,
  };
};

export const useGetCollectionTableProps = (
  obligation: ObjectWithContributors,
  records: ObligationAssessmentResultFlatFields[] | undefined,
  onOpenResult: (id: string) => void,
  onAddRating: () => void
): TablePropsWithActions<ObligationAssessmentResultRegisterFields> => {
  const { t: st } = useTranslation(['common']);
  const props = useGetObligationRatingTableProps(records, onOpenResult);

  return {
    ...useGetTableProps(props),
    empty: (
      <EmptyEntityCollection
        entityLabel={st('obligationsAssessments.entity_name')}
        action={
          <Permission
            permission={'insert:obligation_assessment_result'}
            parentObject={obligation}
          >
            <Button formAction={'none'} onClick={onAddRating}>
              {st('obligationsAssessments.add_rating_button')}
            </Button>
          </Permission>
        }
      />
    ),
  };
};
