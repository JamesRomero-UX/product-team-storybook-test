import type { SeriesClickCallbackFunction } from 'highcharts';
import { useMemo } from 'react';

interface BarChartOptions {
  subtitle?: string;
  orientation?: 'horizontal' | 'vertical';
  onClick?: SeriesClickCallbackFunction;
  stackedBars?: boolean;
  enableLegend?: boolean;
}

export const useGetBarChartDefaultOptions = ({
  subtitle,
  orientation,
  onClick,
  stackedBars,
  enableLegend,
}: BarChartOptions): Highcharts.Options => {
  return useMemo(() => {
    const options: Highcharts.Options = {
      chart: {
        type: (orientation ?? 'horizontal') === 'horizontal' ? 'bar' : 'column',
      },
      subtitle: {
        text: subtitle || '',
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        endOnTick: false,
      },
      legend: {
        enabled: enableLegend ?? false,
      },
      plotOptions: {
        series: {
          stacking: stackedBars ? 'normal' : undefined,
          events: {
            click: onClick,
          },
        },
      },
      tooltip: {
        headerFormat: '<b>{category}</b><br/>',
        pointFormat: '{series.name}: {point.y}',
      },
    };

    return options;
  }, [orientation, subtitle, enableLegend, stackedBars, onClick]);
};
