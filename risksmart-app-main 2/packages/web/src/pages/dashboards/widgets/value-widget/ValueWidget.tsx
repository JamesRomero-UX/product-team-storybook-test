import { chartLayoutColours } from '@risksmart-app/components/src/utils/colours';
import type Highcharts from 'highcharts';
import { type FC, useRef } from 'react';
import useGetPopoverWrappedContent from 'src/components/popover-footer/hooks/useGetPopoverWrappedContent';
import { HighchartsWidget } from 'src/pages/dashboards/HighchartsWidget';

import { NoWidgetData } from '../NoWidgetData';
import { WidgetLoading } from '../widget-loading';

type Props = {
  unit?: string;
  loading?: boolean;
  value?: string;
  onClick?: () => void;
  noClickthroughMessageContent?: string;
};

const ValueWidget: FC<Props> = ({
  value,
  unit,
  loading,
  onClick,
  noClickthroughMessageContent,
}) => {
  const valueEl = useRef<Highcharts.SVGElement | null>(null);
  const unitEl = useRef<Highcharts.SVGElement | null>(null);

  const getContent = useGetPopoverWrappedContent(
    onClick,
    noClickthroughMessageContent
  );

  if (loading) {
    return <WidgetLoading />;
  }

  if (value === undefined) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'value',
      animation: false,
      events: {
        click: onClick,
        render: function () {
          const renderer = this.renderer;

          if (valueEl.current && !renderer.forExport) {
            valueEl.current.destroy();
          }

          if (unitEl.current && !renderer.forExport) {
            unitEl.current.destroy();
          }

          // Needs inline styling for exporting to work
          valueEl.current = renderer
            .text(value, this.chartWidth / 2, this.chartHeight / 2)
            .attr({
              style: `font-size: 40px; line-height: 1; font-weight: bold; text-anchor: middle;${onClick ? ' cursor: pointer;' : ''}`,
              'data-testid': 'tile-value',
            })
            .add();
          unitEl.current = renderer
            .text(unit, this.chartWidth / 2, this.chartHeight / 2 + 20)
            .attr({
              style: `font-size: 16px; line-height: 16px; fill: ${chartLayoutColours.unitColour}; text-anchor: middle;`,
            })
            .add();
        },
      },
    },
  };

  return getContent(<HighchartsWidget options={options} />);
};

export default ValueWidget;
