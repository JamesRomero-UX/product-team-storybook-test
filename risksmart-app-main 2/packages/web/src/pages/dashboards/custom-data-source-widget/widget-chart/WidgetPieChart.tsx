import type { SeriesClickCallbackFunction } from 'highcharts';
import { type FC, useMemo } from 'react';
import { useGetPieChartDefaultOptions } from 'src/components/highcharts';
import { useColourPalette } from 'src/hooks/useColourPalette';

import { HighchartsWidget } from '../../HighchartsWidget';
import { WidgetLoading } from '../../widgets/widget-loading';

export type Props = {
  loading: boolean;
  data: { x: unknown; y: unknown; color?: string; label?: string }[];
  donut: boolean;
  innerMetricValue?: string;
  onSegmentClick?: (data: SegmentData) => void;
  showAsPercentage?: boolean;
};
export type SegmentData = { value: unknown };

export const WidgetPieChart: FC<Props> = ({
  loading,
  data,
  donut,
  onSegmentClick,
  showAsPercentage,
}) => {
  const { genericCategoricalPalette } = useColourPalette();
  const pieData = data?.map((d, i) => ({
    title: d.label ?? String(d.x),
    value: d.y as number,
    x: d.x,
    color: d.color ?? genericCategoricalPalette(i),
  }));

  const total = useMemo(
    () =>
      pieData ? (pieData?.reduce((acc, curr) => acc + curr.value, 0) ?? 0) : 0,
    [pieData]
  );

  const onClick: SeriesClickCallbackFunction = (event) =>
    onSegmentClick?.({ value: pieData[event.point.index].x });

  const defaultOptions = useGetPieChartDefaultOptions({
    donut,
    onClick,
    showAsPercentage,
    label: {
      total: total.toString(),
      description: 'Total',
    },
  });

  if (loading) {
    return <WidgetLoading />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    series: [
      {
        type: 'pie',
        data: pieData.map((p) => ({
          name: p.title,
          y: p.value,
          color: p.color,
        })),
      },
    ],
  };

  return <HighchartsWidget options={options} />;
};
