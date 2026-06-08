import dayjs from 'dayjs';
import type Highcharts from 'highcharts';
import { isDate } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useGetLineChartDefaultOptions } from 'src/components/highcharts';
import { HighchartsWidget } from 'src/pages/dashboards/HighchartsWidget';
import { useDashboardStore } from 'src/pages/dashboards/useDashboardStore';

import { NoWidgetData } from '../../../widgets/NoWidgetData';
import { WidgetLoading } from '../../../widgets/widget-loading';
import { useAggregateCategories } from '../../hooks/useAggregateCategories';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import { useXDomain } from '../../hooks/useXDomain';
import type { CategoryType, WidgetDataSource } from '../../types';
import type { GigaLineWidgetProps } from './GigaLineWidgetProps';
import { useLineDataSeries } from './hooks/useLineDataSeries';

export const GigaLineWidget = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType,
>({
  dataSource,
  variables,
  categoryGetter,
  dateFilterOptions,
  subCategoryGetter,
  subCategoryRatingTranslationKey,
  onClickUrl,
  categoryRatingTranslationKey,
  propertyFilterQuery,
  aggregationType,
  aggregationField,
  categoryOverrideFunction,
  subCategoryOverrideFunction,
}: GigaLineWidgetProps<TDataSource, TCategory, TSubCategory>) => {
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

  const dataSeries = useLineDataSeries(countedCategories, {
    entityNamePlural: dataSource.entityNamePlural,
    category: categoryRatingTranslationKey,
    subCategory: subCategoryRatingTranslationKey,
    categoryOverrideFunction: categoryOverrideFunction,
    subCategoryOverrideFunction: subCategoryOverrideFunction,
  });

  const { t } = useTranslation();

  const onClick = (event: Highcharts.SeriesClickEventObject) => {
    // For datetime x-axis, event.point.x contains the timestamp
    const clickedTimestamp = event.point.x as number;

    // Find the category that corresponds to this date
    const matchedCategory = countedCategories.find(
      (c) => isDate(c.key) && dayjs(c.key).valueOf() === clickedTimestamp
    );

    if (matchedCategory) {
      const url = onClickUrl?.(matchedCategory, filters);
      if (url) {
        navigate(url);
      }
    }
  };

  const enableLegend = useMemo(
    () => Boolean(subCategoryGetter) && dataSeries.length > 1,
    [subCategoryGetter, dataSeries.length]
  );

  const defaultOptions = useGetLineChartDefaultOptions({
    subtitle: `No. of ${t(dataSource.entityNamePlural)}`,
    onClick,
  });

  const getTimestamp = useCallback((d: CategoryType | Date) => {
    return isDate(d) ? dayjs(d).valueOf() : dayjs(String(d)).valueOf();
  }, []);

  if (loading || !allItems) {
    return <WidgetLoading />;
  }

  if (dataSeries.length === 0) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    legend: {
      enabled: enableLegend,
    },
    xAxis: {
      type: 'datetime',
      labels: {
        formatter: function () {
          // Force consistent date formatting regardless of number of data points
          return dayjs(this.value).format(
            dateFilterOptions?.dateFormat || 'DD MMM YYYY'
          );
        },
      },
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e %b',
        week: '%e %b',
        month: "%b '%y",
        year: '%Y',
      },
    },
    tooltip: {
      shared: true,
      formatter: function () {
        // Use dayjs to format the date consistently
        const date = dayjs(this.x);
        const formattedDate = date.format(
          dateFilterOptions?.dateFormat || 'DD MMM YYYY'
        );

        let tooltip = `<b>${formattedDate}</b><br/>`;

        if (this.points) {
          this.points.forEach((point) => {
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}</b><br/>`;
          });
        }

        return tooltip;
      },
    },
    series: dataSeries.map((s) => ({
      type: 'line',
      name: s.title,
      data: xDomain
        ? xDomain.map((d) => {
            const dataPoint = s.data.find(
              (sd) =>
                isDate(sd.x) && dayjs(sd.x).valueOf() === dayjs(d).valueOf()
            );

            return [getTimestamp(d), dataPoint?.y ?? 0];
          })
        : s.data.map((d) => [getTimestamp(d.x), d.y]),
      color: s.color,
    })) as Highcharts.SeriesOptionsType[],
  };

  return <HighchartsWidget options={options} />;
};
