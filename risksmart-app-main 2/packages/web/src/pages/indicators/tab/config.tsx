import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import { conformanceRatingFromResults } from '../calculateConformanceRating';
import { latestResultValueFromData } from '../latestResultValueFromData';
import type { IndicatorFlatFields, IndicatorTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<IndicatorTableFields> => {
  const { getByValue: statusGetByValue } = useRating(
    'indicator_conformance_status'
  );

  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'indicators.columns',
  });

  return useMemo<TableFields<IndicatorTableFields>>(
    () => ({
      Title: {
        formId: 'indicator',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={item.Id}>
            {item.Title}
          </Link>
        ),
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      TestFrequencyLabelled: {
        header: st('test_frequency'),
      },
      LatestResultValue: {
        header: st('latest_result'),
        cell: (item) => {
          const result = latestResultValueFromData(item);
          if (_.isNil(result) || result === '') {
            return '-';
          }
          if (item.Unit) {
            return `${result} ${item.Unit}`;
          }

          return result;
        },
      },
      ConformanceLabelled: {
        header: st('conformance'),
        cell: (item: IndicatorTableFields) => {
          const rating = conformanceRatingFromResults(item);

          return <SimpleRatingBadge rating={statusGetByValue(rating)} />;
        },
      },

      LatestResultDate: dateColumnFromConfig({
        header: { header: st('latest_result_date') },
        dateField: 'LatestResultDate',
      }),
    }),
    [st, statusGetByValue]
  );
};

const useGetIndicatorTableProps = (
  records: IndicatorFlatFields[] | undefined,
  handleCreateOpen: () => void,
  parentObject: ObjectWithContributors
): UseGetTablePropsOptions<IndicatorTableFields> => {
  const { t: stc } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'indicators' });
  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      tableId: 'indicatorRegister',
      data: labelledFields,
      customAttributeFormIds: [],
      entityLabel: stc('indicators.entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:indicator'} parentObject={parentObject}>
          <Button formAction={'none'} onClick={handleCreateOpen}>
            {st('create_new_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey: 'IndicatorsRegisterTable-PreferencesV1',
      enableFiltering: true,
      defaultSortingState: {
        sortingColumn: 'LatestResultDate',
        sortingDirection: 'desc',
      },
      initialColumns: [
        'Title',
        'TestFrequencyLabelled',
        'LatestResultValue',
        'ConformanceLabelled',
        'LatestResultDate',
      ],
      fields,
    }),
    [fields, labelledFields, stc, handleCreateOpen, st, parentObject]
  );
};

export const useGetCollectionTableProps = (
  records: IndicatorFlatFields[] | undefined,
  handleCreateOpen: () => void,
  parentObject: ObjectWithContributors
): TablePropsWithActions<IndicatorTableFields> => {
  const props = useGetIndicatorTableProps(
    records,
    handleCreateOpen,
    parentObject
  );

  return useGetTableProps(props);
};
