import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { DashboardFilter } from 'src/pages/dashboards/useDashboardStore';
import { useDashboardStore } from 'src/pages/dashboards/useDashboardStore';

import NumberWidget from '../../../widgets/number-widget/NumberWidget';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import type {
  AggregationType,
  DataSourceItem,
  GigawidgetCommonProps,
  WidgetDataSource,
} from '../../types';
import { aggregate } from '../../util/categoryFunctions';

export type GigaNumberWidgetProps<TDataSource extends WidgetDataSource> =
  GigawidgetCommonProps<TDataSource> & {
    unit?: string;
    onClickUrl?: (
      data: readonly DataSourceItem<TDataSource>[] | undefined,
      filter: DashboardFilter
    ) => string | undefined;
    aggregationType: AggregationType;
  };

export const GigaNumberWidget = <TDataSource extends WidgetDataSource>({
  dataSource,
  variables,
  dateFilterOptions,
  unit,
  onClickUrl,
  propertyFilterQuery,
  aggregationType,
  aggregationField,
  noClickthroughMessageContent,
}: GigaNumberWidgetProps<TDataSource>) => {
  const navigate = useNavigate();
  const { filters } = useDashboardStore();

  const {
    tableProps: { allItems },
    loading,
  } = useGetWidgetData({
    dataSource,
    variables,
    dateFilterOptions,
    propertyFilterQuery,
  });

  const number = useMemo(() => {
    if (!allItems) {
      return 0;
    }
    const category = {
      key: '',
      label: '',
      data: Array.from(allItems).filter(
        (item) => !aggregationField || item[aggregationField] != null
      ),
      aggregatedValue: 0,
    };
    if (category.data.length === 0 && aggregationType !== 'count') {
      return undefined;
    }
    aggregate([category], aggregationType, aggregationField);

    return category.aggregatedValue;
  }, [allItems, aggregationField, aggregationType]);

  const handleClick = onClickUrl
    ? () => {
        const url = onClickUrl(allItems, filters);
        if (url) {
          navigate(url);
        }
      }
    : undefined;

  return (
    <NumberWidget
      unit={unit}
      value={number}
      loading={loading}
      onClick={handleClick}
      noClickthroughMessageContent={noClickthroughMessageContent}
    />
  );
};
