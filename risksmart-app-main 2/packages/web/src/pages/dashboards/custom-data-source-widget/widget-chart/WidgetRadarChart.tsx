import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import { type FC, useMemo } from 'react';
import { useGetRadarChartDefaultOptions } from 'src/components/highcharts';
import { useColourPalette } from 'src/hooks/useColourPalette';
import { nullDataChartLabel } from 'src/pages/custom-datasources/update/nullData';
import { NoWidgetData } from 'src/pages/dashboards/widgets/NoWidgetData';
import { WidgetLoading } from 'src/pages/dashboards/widgets/widget-loading';

import { HighchartsWidget } from '../../HighchartsWidget';
import { useXDomain } from '../useXDomain';
import type { DatePrecision, Series } from './types';
import type { SegmentData } from './WidgetPieChart';

export type Props = {
  loading: boolean;
  series: Series[];
  xAxisDataType: DataType;
  xAxisDatePrecision: DatePrecision | null;
  onSegmentClick?: (data: SegmentData) => void;
};

export const WidgetRadarChart: FC<Props> = ({
  series,
  xAxisDataType,
  xAxisDatePrecision,
  onSegmentClick,
  loading,
}) => {
  const { genericCategoricalPalette } = useColourPalette();
  const xDomain = useXDomain({
    datePrecision: xAxisDatePrecision,
    dataType: xAxisDataType,
    xAxisData: series
      .flatMap((s) => s.data)
      .filter((d) => d.x)
      .map((d) => d.x as string),
  });

  const onClick = (event: Highcharts.SeriesClickEventObject) => {
    const category = series
      .flatMap((s) => s.data)
      .find((d) => d.label === event.point.category);
    if (category) {
      onSegmentClick?.({ value: category.x });
    }
  };

  const enableLegend = useMemo(
    () => series.some((s) => s.hasSubcategory),
    [series]
  );

  const defaultOptions = useGetRadarChartDefaultOptions({
    subtitle: '',
    onClick,
    enableLegend,
  });

  if (loading) {
    return <WidgetLoading />;
  }

  if (series.length === 0) {
    return <NoWidgetData />;
  }

  const hasNull = series.flatMap((s) => s.data).find((d) => d.x === null);
  if (hasNull && xDomain) {
    xDomain.push(nullDataChartLabel());
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    xAxis: {
      ...defaultOptions.xAxis,
      categories: xDomain ?? series[0].data.map((d) => d.label),
    },
    series: series.map((s, i) => ({
      type: 'column',
      name: s.title as string,
      color: s.color ?? genericCategoricalPalette(i),
      data: xDomain
        ? xDomain.map((category) => {
            const dataPoint = s.data.find((d) => d.label === category);

            return {
              y: (dataPoint?.y as number) || 0,
              color:
                dataPoint?.color ?? s.color ?? genericCategoricalPalette(i),
            };
          })
        : s.data.map((d) => ({
            y: (d.y as number) || 0,
            color: d.color ?? s.color ?? genericCategoricalPalette(i),
          })),
    })),
  };

  return <HighchartsWidget options={options} />;
};
