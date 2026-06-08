import { chartLayoutColours } from '@risksmart-app/components/src/utils/colours';
import type { Chart } from 'highcharts';
import Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import exporting from 'highcharts/modules/exporting';
import heatmap from 'highcharts/modules/heatmap';
import offlineExporting from 'highcharts/modules/offline-exporting';
import type {
  HighchartsReactProps,
  HighchartsReactRefObject,
} from 'highcharts-react-official';
import HighchartsReact from 'highcharts-react-official';
import type { ForwardedRef } from 'react';
import { forwardRef, useEffect } from 'react';
import { handleError } from 'src/utils/errorUtils';

import { useMergeChartOptions } from './hooks/useMergeChartOptions';

type RSHighchartsProps = {
  options: Highcharts.Options;
  containerProps: HighchartsReactProps['containerProps'];
  ref: ForwardedRef<HighchartsReactRefObject>;
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

export const RSHighcharts = forwardRef<
  HighchartsReactRefObject,
  RSHighchartsProps
>(({ options, containerProps }, ref) => {
  useEffect(() => {
    try {
      // Initialize exporting modules - this is the documented method of loading modules
      if (typeof exporting === 'function') {
        // @ts-expect-error
        exporting(Highcharts);
      }
      if (typeof offlineExporting === 'function') {
        // @ts-expect-error
        offlineExporting(Highcharts);
      }
      if (typeof more === 'function') {
        // @ts-expect-error
        more(Highcharts);
      }
    } catch {
      handleError(`Unable to load modules for Highcharts`);
    }
  }, []);

  useEffect(() => {
    if (options.chart?.type === 'heatmap' && typeof heatmap === 'function') {
      try {
        // @ts-expect-error
        heatmap(Highcharts);
      } catch {
        handleError(`Unable to load heatmap module for Highcharts`);
      }
    }
  }, [options.chart?.type]);

  const defaults: Highcharts.Options = {
    credits: {
      enabled: false,
    },
    xAxis: {
      labels: {
        style: {
          color: chartLayoutColours.axisLabels,
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: chartLayoutColours.axisLabels,
        },
      },
    },
    chart: {
      // We have to manually call reflow on render to handle size changes within flexbox/grid layouts
      reflow: false,
      events: {
        render: function (this: Chart) {
          this.reflow();
        },
      },
    },
  };

  const mergedOptions = useMergeChartOptions(defaults, options);

  return (
    <HighchartsReact
      ref={ref}
      highcharts={Highcharts}
      options={mergedOptions}
      containerProps={containerProps}
    />
  );
});
