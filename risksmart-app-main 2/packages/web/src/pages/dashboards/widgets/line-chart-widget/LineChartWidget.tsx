import dayjs from 'dayjs';
import type Highcharts from 'highcharts';
import { isInteger } from 'lodash';
import type { FC } from 'react';
import { useGetLineChartDefaultOptions } from 'src/components/highcharts';
import { useColourPalette } from 'src/hooks/useColourPalette';

import { HighchartsWidget } from '../../HighchartsWidget';
import { NoWidgetData } from '../NoWidgetData';
import { WidgetLoading } from '../widget-loading';

export type Props = {
  loading?: boolean;
  xTitle: string;
  yTitle: string;
  values?: { x: Date; y: number }[];
  series?: {
    name: string;
    data: { x: string; y: number; [key: string]: unknown }[];
  }[];
  tooltipYValueFormatter?: (
    y: number | undefined,
    seriesIndex: number,
    custom?: Record<string, unknown>
  ) => string;
  pointColorFormatter?: (
    y: number | undefined,
    seriesIndex: number,
    custom?: Record<string, unknown>
  ) => string | undefined;
};

const LineChartWidget: FC<Props> = ({
  values,
  series,
  loading,
  xTitle,
  yTitle,
  tooltipYValueFormatter,
  pointColorFormatter,
}) => {
  const { colours } = useColourPalette();
  const defaultOptions = useGetLineChartDefaultOptions({});

  if (loading) {
    return <WidgetLoading />;
  }

  if ((!values || values.length === 0) && (!series || series.length === 0)) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    ...defaultOptions,
    chart: {
      ...defaultOptions.chart,
      events: pointColorFormatter
        ? {
            redraw: function () {
              this.series.forEach((s, index) => {
                s.points.forEach((point) => {
                  const color = pointColorFormatter(
                    point.y,
                    index,
                    point.options?.custom
                  );
                  if (color) {
                    point.update(
                      {
                        color,
                      },
                      false
                    );
                  }
                });
              });
            },
          }
        : {},
    },
    legend: {
      enabled: series ? series.length > 0 : false,
    },
    tooltip: {
      formatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Highcharts types `this` as Point but at runtime it's a tooltip context object
        const point = (this as any).point ?? this;
        const yValue = tooltipYValueFormatter
          ? tooltipYValueFormatter(
              this.y,
              this.series.index,
              point.options?.custom
            )
          : this.y;

        return `<b>${dayjs(this.x).isValid() ? dayjs(this.x).format('D/M/YY') : this.x}</b><br/>${this.series.name}: ${yValue}`;
      },
    },
    xAxis: {
      categories: values
        ? values.map((v) => dayjs(v.x).format('D/M/YY'))
        : undefined,
      title: {
        text: xTitle,
      },
      ...(!values
        ? {
            type: 'datetime',
            minTickInterval: 24 * 3600 * 1000, // one day
            labels: {
              formatter: function () {
                return dayjs(this.value).format('D/M/YY');
              },
              rotation: -45,
            },
          }
        : {}),
    },
    yAxis: {
      allowDecimals: false,
      title: {
        text: yTitle,
      },
      labels: {
        formatter: function () {
          return isInteger(this.value) ? this.value.toString() : '';
        },
      },
    },
    series: values
      ? [
          {
            type: 'line',
            name: yTitle,
            data: values.map((v) => v.y),
            color: colours[0],
          },
        ]
      : series?.map((s, index) => ({
          type: 'line',
          name: s.name,
          data: s.data.map((d) => {
            const { x, y, ...custom } = d;

            return { x: new Date(x).getTime(), y, custom };
          }),
          color: colours[index % colours.length],
        })),
  };

  return <HighchartsWidget options={options} />;
};

export default LineChartWidget;
