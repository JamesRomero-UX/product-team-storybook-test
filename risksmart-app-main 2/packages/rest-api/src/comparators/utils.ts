import _ from 'lodash';
import { isEqual } from 'lodash';

export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null;
};

export const arePropsEqual = <A, B>(
  a: A,
  b: B,
  fieldsToCheck: (keyof A & keyof B)[]
) => {
  for (const field of fieldsToCheck) {
    if (!isEqual(a[field], b[field])) {
      return false;
    }
  }

  return true;
};

export const areUnorderedArraysEqual = (
  a: string[] | string,
  b: string[] | string
) => {
  const sortedA = [...(_.isArray(a) ? a : [a])].sort();
  const sortedB = [...(_.isArray(b) ? b : [b])].sort();

  return isEqual(sortedA, sortedB);
};
