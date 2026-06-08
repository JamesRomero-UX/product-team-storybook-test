import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Indicator } from '@risksmart-app/web-graphql-client/derived-types';
import type {
  GetIndicatorByIdQuery,
  GetIndicatorResultsByIndicatorIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Indicator_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import {
  calculatePercentageDifference,
  conformanceIndicatorRating,
  getConformanceTrendRating,
} from 'src/pages/indicators/calculateConformanceRating';
import type {
  ConformanceIndicatorRating,
  ConformanceTrend,
} from 'src/pages/indicators/types';
import { Permission } from 'src/rbac/Permission';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from 'src/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';

export type IndicatorResultFields =
  GetIndicatorResultsByIndicatorIdQuery['indicator_result'][number] & {
    previous?: GetIndicatorResultsByIndicatorIdQuery['indicator_result'][number];
  };

type IndicatorTableFields = IndicatorResultFields & {
  ModifiedByUserName: string;
  Conformance: ConformanceIndicatorRating;
  ConformanceTrend: ConformanceTrend | null;
  PercentageChange: string;
  Result: string;
};

const useLabelledFields = (
  indicator: GetIndicatorByIdQuery['indicator'][number],
  data: GetIndicatorResultsByIndicatorIdQuery | undefined
) => {
  return useMemo<IndicatorTableFields[]>(() => {
    const labelledFields =
      data?.indicator_result.map((r, i) => ({
        ...r,
        previous: data.indicator_result[i - 1],
      })) || [];

    return labelledFields.map((item) => ({
      ...item,
      ModifiedByUserName: item.modifiedBy?.FriendlyName || '-',
      Description: item.Description || '-',
      Conformance: conformanceIndicatorRating(indicator, item),
      PercentageChange: getPercentageChange(item),
      ConformanceTrend: getConformanceTrendRatingValue(indicator, item),
      Result: getResult(item),
    }));
  }, [data, indicator]);
};

const useGetFieldConfig = (
  onEdit: (indicator: IndicatorTableFields) => void
): TableFields<IndicatorTableFields> => {
  const { getByValue: statusGetByValue } = useRating(
    'indicator_conformance_status'
  );
  const { getByValue: trendGetByValue } = useRating(
    'indicator_conformance_trend'
  );
  const { t } = useTranslation(['common'], {
    keyPrefix: 'indicator_results.columns',
  });

  return useMemo<TableFields<IndicatorTableFields>>(
    () => ({
      ResultDate: {
        formId: 'indicator_result',
        fieldId: 'ResultDate',
        cell: (item) => (
          <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
            {toLocalDate(item.ResultDate)}
          </Link>
        ),
        isRowHeader: true,
      },
      Description: {
        formId: 'indicator_result',
        fieldId: 'Description',
      },
      ModifiedByUserName: {
        header: t('modified_by'),
      },
      Result: {
        header: t('result'),
      },
      Conformance: {
        id: 'conformance',
        header: t('conformance'),
        cell: (item) => (
          <SimpleRatingBadge rating={statusGetByValue(item.Conformance)} />
        ),
      },
      ConformanceTrend: {
        header: t('conformance_trend'),
        cell: (item) => {
          const rating = trendGetByValue(item.ConformanceTrend);

          return <SimpleRatingBadge rating={rating} />;
        },
      },
      PercentageChange: {
        header: t('percentage_change'),
      },
    }),
    [statusGetByValue, trendGetByValue, onEdit, t]
  );
};

const getConformanceTrendRatingValue = (
  indicator: Pick<
    Indicator,
    | 'LowerAppetiteNum'
    | 'LowerToleranceNum'
    | 'TargetValueTxt'
    | 'UpperAppetiteNum'
    | 'UpperToleranceNum'
  >,
  item: IndicatorResultFields
) => {
  const results = [item];
  if (item.previous) {
    results.push(item.previous);
  }

  return getConformanceTrendRating(indicator, results);
};

const getPercentageChange = (item: IndicatorResultFields) => {
  if (item.previous?.TargetValueNum == null || item.TargetValueNum == null) {
    return '-';
  }

  return calculatePercentageDifference(
    item.TargetValueNum,
    item.previous.TargetValueNum
  );
};

export const getResult = (item: {
  TargetValueTxt?: null | string;
  TargetValueNum?: null | number;
  parent?: {
    Type: Indicator_Type_Enum;
  } | null;
}): string => {
  let result = '-';
  if (
    item.parent?.Type === Indicator_Type_Enum.Number &&
    !_.isNil(item.TargetValueNum)
  ) {
    result = `${item.TargetValueNum}`;
  }
  if (item.parent?.Type === Indicator_Type_Enum.Text && item.TargetValueTxt) {
    result = item.TargetValueTxt;
  }

  return result;
};

const useGetIndicatorTableProps = (
  indicator: GetIndicatorByIdQuery['indicator'][number],
  data: GetIndicatorResultsByIndicatorIdQuery | undefined,
  onEdit: (indicator: IndicatorTableFields) => void,
  handleModalOpen: () => void
): UseGetTablePropsOptions<IndicatorTableFields> => {
  const labelledFields = useLabelledFields(indicator, data);
  const { t } = useTranslation(['common'], { keyPrefix: 'indicator_results' });
  const fields = useGetFieldConfig(onEdit);

  return {
    tableId: 'indicatorTab',
    data: labelledFields,
    customAttributeFormIds: [],
    entityLabel: t('entity_name'),
    emptyCollectionAction: (
      <Permission
        permission={'insert:indicator_result'}
        parentObject={indicator}
      >
        <Button formAction={'none'} onClick={handleModalOpen}>
          {t('create_new_button')}
        </Button>
      </Permission>
    ),
    preferencesStorageKey: 'IndicatorTabTable-Preferences',
    enableFiltering: false,
    initialColumns: [
      'ResultDate',
      'Description',
      'ModifiedByUserName',
      'Result',
      'Conformance',
      'ConformanceTrend',
      'PercentageChange',
    ],
    fields,
    defaultSortingState: {
      sortingColumn: 'ResultDate',
      sortingDirection: 'desc',
    },
  };
};

export const useGetCollectionTableProps = (
  indicator: GetIndicatorByIdQuery['indicator'][number],
  data: GetIndicatorResultsByIndicatorIdQuery | undefined,
  onEdit: (indicator: IndicatorTableFields) => void,
  handleModalOpen: () => void
): TablePropsWithActions<IndicatorTableFields> => {
  const props = useGetIndicatorTableProps(
    indicator,
    data,
    onEdit,
    handleModalOpen
  );

  return useGetTableProps(props);
};
