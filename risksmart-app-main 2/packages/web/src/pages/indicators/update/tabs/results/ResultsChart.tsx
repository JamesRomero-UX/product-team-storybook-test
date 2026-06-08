import LineChart from '@risk-smart/themed-cloudscape-components/line-chart';
import type { MixedLineBarChartProps } from '@risk-smart/themed-cloudscape-components/mixed-line-bar-chart';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import dayjs from 'dayjs';
import _ from 'lodash';
import type { FC } from 'react';
import { ConformanceIndicatorRating } from 'src/pages/indicators/types';

type Props = {
  data: { ResultDate: string; TargetValueNum?: null | number }[];
  upperTolerance?: null | number;
  lowerTolerance?: null | number;
  upperAppetite?: null | number;
  lowerAppetite?: null | number;
};

function numberFormatter(e: number) {
  return Math.abs(e) >= 1e9
    ? (e / 1e9).toFixed(1).replace(/\.0$/, '') + 'G'
    : Math.abs(e) >= 1e6
      ? (e / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
      : Math.abs(e) >= 1e3
        ? (e / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
        : e.toFixed(2);
}

const useGetThresholdSeries = ({
  upperTolerance,
  lowerTolerance,
  upperAppetite,
  lowerAppetite,
}: {
  upperTolerance?: null | number;
  lowerTolerance?: null | number;
  upperAppetite?: null | number;
  lowerAppetite?: null | number;
}): MixedLineBarChartProps.ThresholdSeries<Date>[] => {
  const { getColorClass, getLabel } = useRating('indicator_conformance_status');
  const thresholdSeries: MixedLineBarChartProps.ThresholdSeries<Date>[] = [];
  if (!_.isNil(upperTolerance)) {
    thresholdSeries.push({
      title: getLabel(ConformanceIndicatorRating.Outside),
      type: 'threshold',
      y: upperTolerance,
      color: getColorStyles(
        getColorClass(ConformanceIndicatorRating.Outside) ?? ''
      ).backgroundColor,
    });
  }
  if (!_.isNil(upperAppetite)) {
    thresholdSeries.push({
      title: getLabel(ConformanceIndicatorRating.OutsideAppetite),
      type: 'threshold',
      y: upperAppetite,
      color: getColorStyles(
        getColorClass(ConformanceIndicatorRating.OutsideAppetite) ?? ''
      ).backgroundColor,
    });
  }
  if (!_.isNil(lowerAppetite)) {
    thresholdSeries.push({
      title: getLabel(ConformanceIndicatorRating.OutsideAppetite),
      type: 'threshold',
      y: lowerAppetite,
      color: getColorStyles(
        getColorClass(ConformanceIndicatorRating.OutsideAppetite) ?? ''
      ).backgroundColor,
    });
  }
  if (!_.isNil(lowerTolerance)) {
    thresholdSeries.push({
      title: getLabel(ConformanceIndicatorRating.Outside),
      type: 'threshold',
      y: lowerTolerance,
      color: getColorStyles(
        getColorClass(ConformanceIndicatorRating.Outside) ?? ''
      ).backgroundColor,
    });
  }

  return thresholdSeries;
};

const getSeriesData = (
  data: { ResultDate: string; TargetValueNum?: null | number }[]
) => {
  const todayLastYear = dayjs().subtract(1, 'year');

  return data
    .map((d) => ({
      x: new Date(d.ResultDate),
      y: d.TargetValueNum ?? 0,
    }))
    .filter((d) => todayLastYear.isBefore(d.x))
    .sort((a, b) => a.x.getTime() - b.x.getTime());
};

const getYIntervals = ({
  data,
  upperTolerance,
  lowerTolerance,
  upperAppetite,
  lowerAppetite,
}: {
  data: {
    ResultDate: string;
    TargetValueNum?: number | null;
  }[];
  upperTolerance?: null | number;
  lowerTolerance?: null | number;
  upperAppetite?: null | number;
  lowerAppetite?: null | number;
}) => {
  const yValidIntervals = [
    upperTolerance,
    lowerTolerance,
    lowerAppetite,
    upperAppetite,
  ].filter((v) => !_.isNil(v));

  const yIntervalsMin = Math.min(...yValidIntervals);
  const yIntervalsMax = Math.max(...yValidIntervals);

  const validNumsData = data.map((d) => {
    if (_.isNil(d?.TargetValueNum)) {
      return Infinity;
    }

    return d.TargetValueNum;
  });

  const yDataMin = Math.min(...validNumsData);
  const yDataMax = Math.max(...validNumsData);

  const yMinRaw = Math.min(yIntervalsMin, yDataMin);
  const yMaxRaw = Math.max(yIntervalsMax, yDataMax);

  const rangeVariation = (yMaxRaw - yMinRaw) * 0.3;

  const yMin = Math.min(yIntervalsMin, yDataMin) - rangeVariation;
  const yMax = Math.max(yIntervalsMax, yDataMax) + rangeVariation;

  return [yMin, yMax];
};

const ResultsChart: FC<Props> = ({
  data,
  upperTolerance,
  lowerTolerance,
  lowerAppetite,
  upperAppetite,
}) => {
  const thresholdSeries = useGetThresholdSeries({
    upperTolerance,
    lowerTolerance,
    lowerAppetite,
    upperAppetite,
  });

  return (
    <LineChart
      series={[
        {
          title: 'Result',
          type: 'line',
          color: getColorStyles('charts-teal-300').backgroundColor,
          data: getSeriesData(data),
          valueFormatter: numberFormatter,
        },
        ...thresholdSeries,
      ]}
      i18nStrings={{
        xTickFormatter: (e) => e.toLocaleDateString().split(',').join('\n'),
        yTickFormatter: numberFormatter,
      }}
      yDomain={getYIntervals({
        data,
        upperTolerance,
        lowerTolerance,
        upperAppetite,
        lowerAppetite,
      })}
      height={300}
      hideFilter
      hideLegend
      xScaleType={'time'}
      xTitle={'Date'}
      yTitle={'Result'}
    />
  );
};

export default ResultsChart;
