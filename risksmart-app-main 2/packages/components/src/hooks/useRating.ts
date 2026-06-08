import type { Rating } from '@risksmart-app/i18n/src/ratings';
import { getRatingByRange } from '@risksmart-app/i18n/src/ratings';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { hasColor } from '../utils/colours';
import type { RatingKey, RatingOption } from './types';

export type RatingValue = null | number | string | undefined;
export type RatingContext = 'standard' | 'internal_audit';

const normalizeLegacyValues = (value: RatingValue) => {
  return value === null || value === '-' ? undefined : value;
};

export interface UseRatingResponse {
  options: RatingOption[];
  getOptionsByRatingKey: (ratingKey: RatingKey) => RatingOption[];
  getByValue: (value: RatingValue) => RatingOption | undefined;
  getByValueAndRatingKey: (
    ratingKey: RatingKey,
    value: number | string
  ) => RatingOption | undefined;
  getByLabel: (label: string) => RatingOption | undefined;
  getLabel: (value: RatingValue) => string;
  getColorClass: (value: RatingValue) => null | string;
  getByRange: (range: null | number | undefined) => RatingOption | undefined;
  getLabelByIndex: (index: number) => string;
  getIndexByValue: (value: RatingValue) => number | undefined;
}

export const useRating = (
  ratingKey?: RatingKey,
  context: RatingContext = 'standard'
): UseRatingResponse => {
  // Choose the appropriate translation namespace based on context
  const namespace =
    context === 'internal_audit' ? 'internal_audit_ratings' : 'ratings';
  const { t } = useTranslation(namespace);

  // Fallback translation for standard ratings when internal audit doesn't have the rating
  const { t: tStandard } = useTranslation('ratings');

  // Shared helper function to get ratings with fallback logic
  const getRatingsWithFallback = useCallback(
    (key: RatingKey): RatingOption[] => {
      if (!key) {
        return [];
      }

      const ratings = t(key, {
        returnObjects: true,
      }) as RatingOption[];

      // If internal audit context and no ratings found, fallback to standard
      if (
        context === 'internal_audit' &&
        (!ratings || ratings.length === 0 || typeof ratings === 'string')
      ) {
        return tStandard(key, {
          returnObjects: true,
        }) as RatingOption[];
      }

      return ratings;
    },
    [t, tStandard, context]
  );

  const options: RatingOption[] = useMemo(() => {
    return getRatingsWithFallback(ratingKey);
  }, [getRatingsWithFallback, ratingKey]);

  const getOptionsByRatingKey = useCallback(
    (key: RatingKey): RatingOption[] => {
      return getRatingsWithFallback(key);
    },
    [getRatingsWithFallback]
  );

  const supportsPending = options?.some((option) => option.value === 'pending');

  const getByValue = useCallback(
    (value: RatingValue) => {
      const foundValue = options?.find(
        (option) => option.value === normalizeLegacyValues(value)
      );

      if (foundValue) {
        return foundValue;
      }

      return supportsPending
        ? options?.find((option) => option.value === 'pending')
        : undefined;
    },
    [options, supportsPending]
  );

  const getIndexByValue = useCallback(
    (value: RatingValue) => {
      const foundIndex = options?.findIndex(
        (option) => option.value === normalizeLegacyValues(value)
      );

      if (foundIndex !== undefined && foundIndex >= 0) {
        return foundIndex;
      }

      return supportsPending
        ? options?.findIndex((option) => option.value === 'pending')
        : undefined;
    },
    [options, supportsPending]
  );

  const getByValueAndRatingKey = useCallback(
    (
      ratingKey: RatingKey,
      value: number | string
    ): RatingOption | undefined => {
      const options = getOptionsByRatingKey(ratingKey);

      return options.find((r) => r.value === value);
    },
    [getOptionsByRatingKey]
  );

  const getByRange = useCallback(
    (value: null | number | undefined) =>
      getRatingByRange(options as Rating[], value || null),
    [options]
  );

  const getByLabel = useCallback(
    (label: string) => {
      return options?.find((option) => option.label === label);
    },
    [options]
  );

  const getLabelByIndex = useCallback(
    (index: number) => options[index]?.label || '',
    [options]
  );

  const getLabel = useCallback(
    (value: RatingValue) => getByValue(value)?.label || '',
    [getByValue]
  );

  const getColorClass = useCallback(
    (value: RatingValue): null | string => {
      const item = getByValue(value);

      return hasColor(item) ? item.color : null;
    },
    [getByValue]
  );

  return useMemo(
    () => ({
      options,
      getByValue,
      getOptionsByRatingKey,
      getByValueAndRatingKey,
      getByLabel,
      getLabel,
      getColorClass,
      getByRange,
      getLabelByIndex,
      getIndexByValue,
    }),
    [
      options,
      getByValue,
      getOptionsByRatingKey,
      getByValueAndRatingKey,
      getByLabel,
      getLabel,
      getColorClass,
      getByRange,
      getLabelByIndex,
      getIndexByValue,
    ]
  );
};

/**
 * Hook specifically for internal audit ratings - automatically uses the internal audit context
 */
export const useInternalAuditRating = (
  ratingKey?: RatingKey
): UseRatingResponse => {
  return useRating(ratingKey, 'internal_audit');
};
