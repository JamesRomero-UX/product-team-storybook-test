import { chartLayoutColours } from '@risksmart-app/components/src/utils/colours';
import type { Chart, ChartOptions } from 'highcharts';
import Highcharts from 'highcharts';
import type { HighchartsReactRefObject } from 'highcharts-react-official';
import { forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import { useDashboardBulkExportStore } from 'src/pages/dashboards/useDashboardBulkExportStore';
import { useWidgetContext } from 'src/pages/dashboards/widget-context/WidgetContext';

import { useGetChartCanvas } from '../../components/highcharts/hooks/useGetChartCanvas';
import { useMergeChartOptions } from '../../components/highcharts/hooks/useMergeChartOptions';
import { RSHighcharts } from '../../components/highcharts/RSHighcharts';

type RSHighchartsProps = {
  options: Highcharts.Options;
};

type HighchartsOptionsWithRequiredLoad = Omit<Highcharts.Options, 'chart'> & {
  chart: Omit<ChartOptions, 'events'> & {
    events: {
      load: (this: Chart, event: Event) => void;
    };
  };
};

// Todo: Figure out how to get working with styledMode and style modules
// Font family must be set globally for Highcharts to apply correctly
Highcharts.setOptions({
  chart: {
    style: {
      fontFamily: 'Sora, sans-serif',
    },
  },
});

export const HighchartsWidget = forwardRef<
  HighchartsReactRefObject,
  RSHighchartsProps
>(({ options }, ref) => {
  const widgetData = useWidgetContext();
  const { t } = useTranslation(['common'], { keyPrefix: 'export' });
  const [widgetSettings] = useDashboardWidgetSettings<{
    title?: string;
  }>();

  const {
    addWidgetExport: addBulkWidgetExport,
    removeWidgetExport: removeBulkWidgetExport,
  } = useDashboardBulkExportStore();
  const getChartCanvas = useGetChartCanvas();

  useEffect(() => {
    return () => {
      removeBulkWidgetExport(widgetData?.widgetId || '');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaults: HighchartsOptionsWithRequiredLoad = {
    accessibility: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      chartOptions: {
        title: {
          text: widgetSettings?.title || '',
          align: options.chart?.type === 'value' ? 'center' : 'left',
          style: {
            fontSize: '14px',
            fontWeight: '700',
            color: chartLayoutColours.titles,
          },
        },
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
            },
          },
        },
      },
      buttons: undefined,
      fallbackToExportServer: false,
    },
    title: {
      text: undefined,
    },
    // Subtitle is used as the main browser display title, with title set only for exports (generally
    // the board item header)
    subtitle: {
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: '700',
        color: chartLayoutColours.titles,
      },
    },
    yAxis: {
      title: { text: '' },
    },
    chart: {
      // We have to manually call reflow on render to handle size changes within flexbox/grid layouts
      reflow: false,
      events: {
        load: function (this: Chart) {
          // Highcharts makes a minimal copy of the chart (without this.exporting.exportChart)
          // when exporting which fires the load function again - we can check for this with
          // the forExport property and not reset the export functions
          if (
            !widgetData ||
            this.renderer?.forExport ||
            this.options?.chart?.type === 'richText'
          ) {
            return;
          }

          // Register export function for bulk export (triggered from dashboard level)
          addBulkWidgetExport({
            id: widgetData.widgetId,
            exportFn: () => getChartCanvas(this),
          });

          // Set up custom export buttons on the chart (triggered from individual widget level)
          widgetData.setExportFns?.([
            {
              id: 'exportPNG',
              text: t('images.export_png'),
              fn: () => {
                this.exporting.exportChart({ type: 'image/png' });
              },
            },
            {
              id: 'exportJPEG',
              text: t('images.export_jpeg'),
              fn: () => {
                this.exporting.exportChart({ type: 'image/jpeg' });
              },
            },
            {
              id: 'exportSVG',
              text: t('images.export_svg'),
              fn: () => {
                this.exporting.exportChart({ type: 'image/svg+xml' });
              },
            },
          ]);
        },
      },
    },
  };

  const mergedOptions = useMergeChartOptions(defaults, options);

  return (
    <RSHighcharts
      ref={ref}
      options={mergedOptions}
      // Explicitly set container height to ensure it fills the parent
      // otherwise chart gets default height of 400px
      containerProps={{
        style: { height: '99%' },
      }}
    />
  );
});
