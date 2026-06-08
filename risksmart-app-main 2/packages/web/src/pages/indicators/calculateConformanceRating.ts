import type {
  Indicator,
  Indicator_Result,
} from '@risksmart-app/web-graphql-client/derived-types';
import _ from 'lodash';

import type { IndicatorFlatFields } from './types';
import { ConformanceIndicatorRating, ConformanceTrend } from './types';

export const conformanceIndicatorRating = (
  indicator: Pick<
    Indicator,
    | 'LowerAppetiteNum'
    | 'LowerToleranceNum'
    | 'TargetValueTxt'
    | 'UpperAppetiteNum'
    | 'UpperToleranceNum'
  >,
  indicatorResult: Partial<
    Pick<Indicator_Result, 'TargetValueNum' | 'TargetValueTxt'>
  > = {}
): ConformanceIndicatorRating => {
  const { TargetValueNum = null, TargetValueTxt = null } = indicatorResult;
  const {
    TargetValueTxt: targetTxt = '',
    UpperToleranceNum,
    LowerToleranceNum,
    UpperAppetiteNum,
    LowerAppetiteNum,
  } = indicator;

  let result = ConformanceIndicatorRating.NotSet;

  if (TargetValueNum !== null) {
    if (
      UpperToleranceNum === null &&
      LowerToleranceNum === null &&
      LowerAppetiteNum === null &&
      UpperAppetiteNum === null
    ) {
      return ConformanceIndicatorRating.NotSet;
    }

    if (!_.isNil(LowerToleranceNum)) {
      if (TargetValueNum < LowerToleranceNum) {
        return ConformanceIndicatorRating.Outside;
      }
    }
    if (!_.isNil(LowerAppetiteNum)) {
      if (TargetValueNum < LowerAppetiteNum) {
        return ConformanceIndicatorRating.OutsideAppetite;
      }
    }
    if (!_.isNil(UpperToleranceNum)) {
      if (TargetValueNum > UpperToleranceNum) {
        return ConformanceIndicatorRating.Outside;
      }
    }
    if (!_.isNil(UpperAppetiteNum)) {
      if (TargetValueNum > UpperAppetiteNum) {
        return ConformanceIndicatorRating.OutsideAppetite;
      }
    }

    return ConformanceIndicatorRating.Within;
  }
  if (TargetValueTxt) {
    // compare txt stripped whitespace and check case insensitive.
    result =
      TargetValueTxt.replace(/\s+/g, '').localeCompare(
        (targetTxt || '').replace(/\s+/g, ''),
        undefined,
        { sensitivity: 'base' }
      ) === 0
        ? ConformanceIndicatorRating.Within
        : ConformanceIndicatorRating.Outside;
  }

  return result;
};

export const getConformanceTrendRating = (
  indicator: Pick<
    Indicator,
    | 'LowerAppetiteNum'
    | 'LowerToleranceNum'
    | 'TargetValueTxt'
    | 'UpperAppetiteNum'
    | 'UpperToleranceNum'
  >,
  results: Partial<
    Pick<Indicator_Result, 'TargetValueNum' | 'TargetValueTxt'>
  >[]
): ConformanceTrend | null => {
  if (results.length < 2) {
    return null;
  }
  const currentRating = conformanceIndicatorRating(indicator, results[0]);
  const previousRating = conformanceIndicatorRating(indicator, results[1]);
  if (currentRating === previousRating) {
    return ConformanceTrend.Stable;
  }

  const order = [
    ConformanceIndicatorRating.Outside,
    ConformanceIndicatorRating.OutsideAppetite,
    ConformanceIndicatorRating.Within,
  ];

  return order.indexOf(currentRating) > order.indexOf(previousRating)
    ? ConformanceTrend.Improving
    : ConformanceTrend.Deteriorating;
};

export const conformanceRatingFromResults = (
  data: Pick<
    IndicatorFlatFields,
    | 'orderedResults'
    | 'LowerToleranceNum'
    | 'TargetValueTxt'
    | 'UpperToleranceNum'
  >
) => {
  return conformanceIndicatorRating(data, data.orderedResults[0]);
};

export const calculatePercentageDifference = (
  currentValue: number,
  previousValue: number
): string => {
  if (currentValue === previousValue) {
    return '0%';
  }

  if (previousValue === 0) {
    return '-';
  }

  const percentageDifference = Math.round(
    Math.abs((1 - currentValue / previousValue) * 100)
  );

  const sign = previousValue < currentValue ? '+' : '-';

  return `${sign}${percentageDifference}%`;
};
