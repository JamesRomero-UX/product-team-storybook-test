import 'dayjs/plugin/quarterOfYear';

import i18next from '@risksmart-app/i18n/src/i18n';
import type { ParseKeys } from 'i18next';
import _ from 'lodash';
import type {
  RatingOption,
  RatingWithColor,
  RatingWithColorAndLikelihoodImpact,
  RatingWithColorAndRange,
  RatingWithRange,
} from 'src/ratings/ratings';

export const range = (start: number, stop: number, step = 1) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

// Narrow range type to RatingWithColor
export const hasColor = (
  item: unknown
): item is RatingWithColor | RatingWithColorAndRange => {
  if ((item as RatingOption)?.color) {
    return true;
  }

  return false;
};

// Narrow range type to RatingWithRange
export const hasRange = (
  item: unknown
): item is RatingWithColorAndRange | RatingWithRange => {
  if ((item as RatingOption)?.range) {
    return true;
  }

  return false;
};

export const hasLikelihoodImpact = (
  item: unknown
): item is RatingWithColorAndLikelihoodImpact => {
  if ((item as RatingWithColorAndLikelihoodImpact).likelihoodImpact) {
    return true;
  }

  return false;
};

export const toTitleCase = (str: string): string => _.startCase(_.toLower(str));

// TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
export const labelWithPlural = (label: ParseKeys<'common'> | string) => {
  // Use the _one / _other support for plurals, fallback to our plural function
  // Find the singular entity label, this will attempt to find label_one, however will fall back to label
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  const single = i18next.t(label as ParseKeys<'common'>, { count: 1 });
  // Find the multiple entity label, this will attempt to find label_other, however will fall back to label
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  let plural = i18next.t(label as ParseKeys<'common'>, { count: 2 });
  // If the singular and the plural are the same, assume we need to use the previous logic for throwing an s on with the plural formatter.
  if (single === plural) {
    plural = i18next.format(label, 'plural');
  }

  return {
    single: single,
    plural: plural,
  };
};

export const isString = (key: unknown): key is string => {
  return typeof key === 'string';
};

export const isStringArray = (key: unknown): key is string[] => {
  return Array.isArray(key) && key.every((k) => typeof k === 'string');
};
