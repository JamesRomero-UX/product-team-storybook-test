import dayjs from 'dayjs';
import type Highcharts from 'highcharts';
import { isDate } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useGetBarChartDefaultOptions } from 'src/components/highcharts';
import { HighchartsWidget } from 'src/pages/dashboards/HighchartsWidget';
import { useDashboardStore } from 'src/pages/dashboards/useDashboardStore';

import { NoWidgetData } from '../../../widgets/NoWidgetData';
import { WidgetLoading } from '../../../widgets/widget-loading';
import { useAggregateCategories } from '../../hooks/useAggregateCategories';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import { useXDomain } from '../../hooks/useXDomain';
import type { CategoryType, WidgetDataSource } from '../../types';
import type { GigaBarWidgetProps } from './GigaBarWidgetProps';
import { useDataSeries } from './hooks/useBarDataSeries';

export const GigaBarWidget = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType,
>({
  dataSource,
  variables,
  categoryGetter,
  orientation,
  dateFilterOptions,
  subCategoryGetter,
  subCategoryRatingTranslationKey,
  stackedBars,
  onClickUrl,
  categoryRatingTranslationKey,
  propertyFilterQuery,
  aggregationType,
  aggregationField,
  categoryOverrideFunction,
  subCategoryOverrideFunction,
}: GigaBarWidgetProps<TDataSource, TCategory, TSubCategory>) => {
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
    subCategoryGetter,
    aggregationType,
    aggregationField,
  });

  const xDomain = useXDomain(countedCategories, dateFilterOptions);

  const dataSeries = useDataSeries(countedCategories, {
    entityNamePlural: dataSource.entityNamePlural,
    category: categoryRatingTranslationKey,
    subCategory: subCategoryRatingTranslationKey,
    categoryOverrideFunction: categoryOverrideFunction,
    subCategoryOverrideFunction: subCategoryOverrideFunction,
  });

  const { t } = useTranslation();

  const onClick = (event: Highcharts.SeriesClickEventObject) => {
    const category = countedCategories.find(
      (c) => c.label === (event.point.category as string)
    );
    if (category) {
      const url = onClickUrl?.(category, filters);
      if (url) {
        navigate(url);
      }
    }
  };

  const enableLegend = useMemo(
    () => stackedBars && Boolean(subCategoryGetter),
    [stackedBars, subCategoryGetter]
  );

  const defaultOptions = useGetBarChartDefaultOptions({
    subtitle: `No. of ${t(dataSource.entityNamePlural)}`,
    orientation,
    stackedBars,
    onClick,
    enableLegend,
  });

  if (loading || !allItems) {
    return <WidgetLoading />;
  }

  if (dataSeries.length === 0) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    xAxis: {
      categories:
        xDomain?.map((d) =>
          isDate(d) ? dayjs(d).format(dateFilterOptions?.dateFormat) : String(d)
        ) ?? dataSeries[0].data.map((d) => String(d.x)),
    },
    series: dataSeries.reverse().map((s) => ({
      name: s.title,
      data: xDomain
        ? xDomain.map(
            (d) => s.data.find((sd) => String(sd.x) === String(d))?.y ?? 0
          )
        : s.data.map((d) => d.y),
      color: s.color,
    })) as Highcharts.SeriesOptionsType[],
  };

  return <HighchartsWidget options={options} />;
};
