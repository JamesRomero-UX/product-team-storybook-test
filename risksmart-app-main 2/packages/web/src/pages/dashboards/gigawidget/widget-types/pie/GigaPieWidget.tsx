import i18n from '@risksmart-app/i18n/src/i18n';
import type Highcharts from 'highcharts';
import type { SeriesClickCallbackFunction } from 'highcharts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useGetPieChartDefaultOptions } from 'src/components/highcharts';
import { HighchartsWidget } from 'src/pages/dashboards/HighchartsWidget';
import { useDashboardStore } from 'src/pages/dashboards/useDashboardStore';

import { NoWidgetData } from '../../../widgets/NoWidgetData';
import { WidgetLoading } from '../../../widgets/widget-loading';
import { useAggregateCategories } from '../../hooks/useAggregateCategories';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import type { CategoryType, WidgetDataSource } from '../../types';
import type { GigaPieWidgetProps } from './GigaPieWidgetProps';
import { usePieChartData } from './hooks/usePieChartData';

export const GigaPieWidget = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
>({
  dataSource,
  variables,
  categoryGetter,
  dateFilterOptions,
  onClickUrl,
  categoryRatingTranslationKey,
  categoryOverrideFunction,
  propertyFilterQuery,
  aggregationType,
  aggregationField,
  donut,
  showAsPercentage,
}: GigaPieWidgetProps<TDataSource, TCategory>) => {
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

  const navigate = useNavigate();

  const countedCategories = useAggregateCategories({
    dataSource,
    items: allItems,
    dateFilterOptions,
    categoryGetter,
    aggregationType,
    aggregationField,
  });

  const { t } = useTranslation();

  const pieChartData = usePieChartData(countedCategories, {
    categoryOverrideFunction,
    categoryKey: categoryRatingTranslationKey,
  });

  const total = useMemo(
    () => (allItems ? (allItems?.length ?? 0) : 0),
    [allItems]
  );

  const description = useMemo(
    () => i18n.format(t(dataSource.entityNamePlural), 'capitalizeAll'),
    [dataSource.entityNamePlural, t]
  );

  const onClick: SeriesClickCallbackFunction = (event) => {
    const segment = pieChartData[event.point.index];
    const category = segment?.category;
    if (category && onClickUrl) {
      const url = onClickUrl(category, filters);
      if (url) {
        navigate(url);
      }
    }
  };

  const defaultOptions = useGetPieChartDefaultOptions({
    donut,
    onClick,
    showAsPercentage,
    label: {
      total: total.toString(),
      description,
    },
  });

  if (loading) {
    return <WidgetLoading />;
  }

  if (pieChartData.length === 0) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    series: [
      {
        type: 'pie',
        name: t(dataSource.entityNamePlural) as string,
        data: pieChartData.map((p) => ({
          name: p.title,
          y: p.value,
          color: p.color,
        })),
      },
    ],
  };

  return <HighchartsWidget options={options} />;
};
