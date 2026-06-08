import {
  chartLayoutColours,
  getColorStyles,
} from '@risksmart-app/components/src/utils/colours';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type Highcharts from 'highcharts';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { HighchartsWidget } from '../../HighchartsWidget';
import { NoWidgetData } from '../NoWidgetData';
import { WidgetLoading } from '../widget-loading';
import type { CellClickData, HeatmapCellData } from './types';

type Props = {
  loading?: boolean;
  data: HeatmapCellData[][];
  onCellClick?: (data: CellClickData) => void;
  controlType: Risk_Assessment_Result_Control_Type_Enum;
  getImpactLabelByIndex: (index: number) => string;
  getLikelihoodLabelByIndex: (index: number) => string;
};

const HeatmapWidget: FC<Props> = ({
  data,
  loading,
  onCellClick,
  controlType,
  getImpactLabelByIndex,
  getLikelihoodLabelByIndex,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix:
      controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
        ? 'dashboard.widgets.controlledRiskHeatMap'
        : 'dashboard.widgets.uncontrolledRiskHeatMap',
  });

  const seriesData = useMemo(
    () =>
      data.flatMap((row, y) =>
        row.map((cell, x) => ({
          x,
          y,
          value: cell.value,
          color: getColorStyles(cell.background).backgroundColor,
          cellData: cell,
          likelihoodLabel: getLikelihoodLabelByIndex(y),
          impactLabel: getImpactLabelByIndex(x),
        }))
      ),
    [data, getLikelihoodLabelByIndex, getImpactLabelByIndex]
  );

  if (loading) {
    return <WidgetLoading />;
  }

  if (!data || data.length === 0) {
    return <NoWidgetData />;
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
      plotBorderWidth: 0,
    },
    colorAxis: {
      visible: false,
    },
    subtitle: {
      text: '',
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      lineWidth: 0,
      labels: {
        enabled: false,
      },
      minorTickLength: 0,
      tickLength: 0,
      title: {
        text: t('xAxisTitle'),
      },
    },
    yAxis: {
      labels: {
        enabled: false,
      },
      title: {
        text: t('yAxisTitle'),
      },
    },
    tooltip: {
      headerFormat: '',
      pointFormat:
        `<b>${t('popover.likelihood')}:</b><br />{point.likelihoodLabel}<br /><br />` +
        `<b>${t('popover.impact')}:</b><br />{point.impactLabel}<br /><br />` +
        `<b>${t('popover.recordCount')}:</b><br />{point.value}<br /><br />` +
        `<b>${t('popover.label')}:</b><br />{point.cellData.label}`,
    },
    series: [
      {
        type: 'heatmap',
        borderWidth: 5,
        borderRadius: 5,
        borderColor: chartLayoutColours.seriesBorders,
        data: seriesData,
        dataLabels: {
          enabled: true,
          format: '{point.value}',
        },
        point: {
          events: {
            click: function (this: Highcharts.Point) {
              if (this.x === undefined || this.y === undefined) {
                return;
              }
              const cellData = data[this.y][this.x];
              onCellClick?.({
                data: cellData,
                x: this.x,
                y: this.y,
              });
            },
          },
        },
      } as Highcharts.SeriesOptionsType,
    ],
  };

  return <HighchartsWidget options={options} />;
};

export default HeatmapWidget;
