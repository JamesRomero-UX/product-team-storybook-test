import type { SeriesClickCallbackFunction } from 'highcharts';
import { useMemo } from 'react';

interface LineChartOptions {
  subtitle?: string;
  onClick?: SeriesClickCallbackFunction;
}

export const useGetLineChartDefaultOptions = ({
  subtitle,
  onClick,
}: LineChartOptions): Highcharts.Options => {
  return useMemo(() => {
    const options: Highcharts.Options = {
      chart: {
        type: 'line',
      },
      subtitle: {
        text: subtitle || '',
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
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
  }, [subtitle, onClick]);
};
