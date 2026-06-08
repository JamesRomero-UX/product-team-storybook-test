import _ from 'lodash';

import type { IndicatorFlatFields } from './types';

export const latestResultValueFromData = (
  data: Pick<IndicatorFlatFields, 'orderedResults'>
) => {
  const [{ TargetValueNum = null, TargetValueTxt = null } = {}] =
    data.orderedResults || [];

  return getValue(TargetValueNum, TargetValueTxt);
};

export const previousResultValueFromData = (
  data: Pick<IndicatorFlatFields, 'orderedResults'>
) => {
  const [, { TargetValueNum = null, TargetValueTxt = null } = {}] =
    data.orderedResults || [];

  return getValue(TargetValueNum, TargetValueTxt);
};

const getValue = (
  TargetValueNum: null | number,
  TargetValueTxt: null | string
) => {
  if (!_.isNil(TargetValueTxt)) {
    return TargetValueTxt;
  } else if (!_.isNil(TargetValueNum)) {
    return TargetValueNum.toString();
  }

  return '';
};
