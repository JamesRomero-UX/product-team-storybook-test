import { isInteger } from 'lodash';

export const onlyShowIntegers = (value: number) =>
  isInteger(value) ? value.toString() : '';
