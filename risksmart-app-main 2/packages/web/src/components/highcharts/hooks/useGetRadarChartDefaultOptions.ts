import type { SeriesClickCallbackFunction } from 'highcharts';
import { useMemo } from 'react';

interface RadarChartOptions {
  subtitle?: string;
  onClick?: SeriesClickCallbackFunction;
  enableLegend?: boolean;
}

export const useGetRadarChartDefaultOptions = ({
  subtitle,
  onClick,
  enableLegend,
}: RadarChartOptions): Highcharts.Options => {
  return useMemo(() => {
    const options: Highcharts.Options = {
      chart: {
        polar: true,
      },
      subtitle: {
        text: subtitle || '',
      },
      xAxis: {
        tickmarkPlacement: 'between',
        lineWidth: 0,
      },
      yAxis: {
        gridLineInterpolation: 'circle',
        lineWidth: 0,
        min: 0,
        allowDecimals: false,
        endOnTick: false,
      },
      legend: {
        enabled: enableLegend ?? false,
      },
      plotOptions: {
        series: {
          events: {
            click: onClick,
          },
        },
        column: {
          pointPadding: 0,
          groupPadding: 0,
        },
      },
      tooltip: {
        shared: true,
        pointFormat: '{series.name}: {point.y}<br/>',
        headerFormat: '<b>{category}</b><br/>',
      },
    };

    return options;
  }, [subtitle, enableLegend, onClick]);
};
