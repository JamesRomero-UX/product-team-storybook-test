import type { Chart } from 'highcharts';
import { mergeWith } from 'lodash';
import { useMemo } from 'react';

export const useMergeChartOptions = (
  object: Highcharts.Options,
  src: Highcharts.Options
): Highcharts.Options =>
  useMemo(
    () =>
      mergeWith(object, src, (objVal, srcVal) => {
        // Custom merge function to combine event handlers instead of overwriting
        if (typeof objVal === 'function' && typeof srcVal === 'function') {
          return function (this: Chart, event: Event) {
            srcVal.call(this, event);
            objVal.call(this, event);
          };
        }

        // For all other properties, use default merge behavior
        return undefined;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src]
  );
