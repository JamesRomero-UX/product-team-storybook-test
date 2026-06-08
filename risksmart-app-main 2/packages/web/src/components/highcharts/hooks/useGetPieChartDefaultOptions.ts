import type { SeriesClickCallbackFunction, TitleOptions } from 'highcharts';
import { useMemo } from 'react';

interface PieChartOptions {
  donut?: boolean;
  onClick?: SeriesClickCallbackFunction;
  showAsPercentage?: boolean;
  label?: {
    total: string;
    description: string;
  };
}

const getLabelHtml = (
  donut: boolean | undefined,
  label: PieChartOptions['label']
) => {
  if (donut && label) {
    return `
        <span style="font-weight: 700;">${label?.total}</span>
        <br />
        <span style="font-size: 75%;">${label?.description}</span>`;
  }

  return '';
};

const getTitleOptions = (
  donut: boolean | undefined,
  label: PieChartOptions['label']
): TitleOptions => {
  return {
    verticalAlign: 'middle',
    align: 'center',
    floating: true,
    useHTML: true,
    text: getLabelHtml(donut, label),
  };
};

export const useGetPieChartDefaultOptions = ({
  donut,
  onClick,
  showAsPercentage,
  label,
}: PieChartOptions): Highcharts.Options => {
  return useMemo(() => {
    const options: Highcharts.Options = {
      chart: {
        type: 'pie',
        events: {
          render: function () {
            if (this.plotWidth) {
              const rootFontSize = parseFloat(
                getComputedStyle(document.documentElement).fontSize
              );
              const fontSizePx = Math.max(
                0.625 * rootFontSize, // 0.425rem min
                Math.min(1.2 * rootFontSize, this.chartWidth * 0.045) // 1.2rem max
              );
              const fontSizeRem = fontSizePx / rootFontSize;
              this.setTitle({
                style: { fontSize: fontSizeRem + 'rem' },
              });
            }
          },
        },
      },
      exporting: {
        chartOptions: {
          title: getTitleOptions(donut, label),
        },
        filename: 'chart',
      },
      title: getTitleOptions(donut, label),
      plotOptions: {
        pie: {
          size: '75%',
          innerSize: donut ? '75%' : '0',
          center: ['50%', '50%'], // force chart to be centered to ensure label is positioned correctly
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: `{point.name}<br />${showAsPercentage ? '{point.percentage:.0f}%' : '{point.y}'}`,
            crop: false,
            overflow: 'allow',
            style: {
              textOverflow: 'none',
              textAlign: 'left',
            },
          },
          events: {
            click: onClick,
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 510,
            },
            chartOptions: {
              plotOptions: {
                pie: {
                  size: '60%',
                  dataLabels: {
                    enabled: true,
                    style: {
                      fontSize: '10px',
                    },
                    distance: 5,
                  },
                },
              },
            },
          },
          {
            condition: {
              maxWidth: 350,
            },
            chartOptions: {
              plotOptions: {
                pie: {
                  size: '50%',
                  dataLabels: {
                    enabled: true,
                    style: {
                      fontSize: '8px',
                    },
                    distance: 3,
                  },
                },
              },
            },
          },
        ],
      },
      tooltip: {
        headerFormat: '<b>{point.name}</b><br/>',
        pointFormat:
          'Count: {point.y}<br/> Percentage: {point.percentage:.1f}%',
        outside: true,
      },
    };

    return options;
  }, [label, donut, onClick, showAsPercentage]);
};
