import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import { type FC, useMemo } from 'react';
import { useGetBarChartDefaultOptions } from 'src/components/highcharts';
import { useColourPalette } from 'src/hooks/useColourPalette';
import { nullDataChartLabel } from 'src/pages/custom-datasources/update/nullData';
import { HighchartsWidget } from 'src/pages/dashboards/HighchartsWidget';
import { NoWidgetData } from 'src/pages/dashboards/widgets/NoWidgetData';
import { WidgetLoading } from 'src/pages/dashboards/widgets/widget-loading';

import { useXDomain } from '../../useXDomain';
import type { DatePrecision, Series } from '../types';
import type { SegmentData } from '../WidgetPieChart';

export type Props = {
  loading: boolean;
  series: Series[];
  xAxisDataType: DataType;
  xAxisDatePrecision: DatePrecision | null;
  stackedBars?: boolean;
  onSegmentClick?: (data: SegmentData) => void;
};

export const WidgetBarChart: FC<Props> = ({
  loading,
  series,
  xAxisDataType,
  xAxisDatePrecision,
  stackedBars,
  onSegmentClick,
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

  const hasNull = series.flatMap((s) => s.data).find((d) => d.x === null);
  if (hasNull && xDomain) {
    xDomain.push(nullDataChartLabel());
  }

  const onClick = (event: Highcharts.SeriesClickEventObject) => {
    const category = series
      .flatMap((s) => s.data)
      .find((d) => d.label === event.point.category);
    if (category) {
      onSegmentClick?.({ value: category.x });
    }
  };

  const enableLegend = useMemo(
    () => stackedBars && series.some((s) => s.hasSubcategory),
    [stackedBars, series]
  );

  const defaultOptions = useGetBarChartDefaultOptions({
    subtitle: '',
    orientation: 'vertical',
    stackedBars,
    onClick,
    enableLegend,
  });

  if (loading) {
    return <WidgetLoading />;
  }

  if (series.length === 0) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    xAxis: {
      categories: xDomain ?? series[0].data.map((d) => d.label),
    },
    series: series.map((d, i) => ({
      type: 'column',
      name: d.title as string,
      color: d.color ?? genericCategoricalPalette(i),
      data: d.data.map((d) => (d.y as number | string) || 0),
    })),
  };

  return <HighchartsWidget options={options} />;
};
