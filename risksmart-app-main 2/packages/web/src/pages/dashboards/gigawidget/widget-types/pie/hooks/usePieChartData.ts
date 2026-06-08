import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Colour } from '@risksmart-app/components/src/utils/colours';
import { colours } from '@risksmart-app/components/src/utils/colours';
import type { KeyPrefix } from 'i18next';
import { isDate } from 'lodash';
import { useColourPalette } from 'src/hooks/useColourPalette';

import type { UseRiskScoreFormattersResponse } from '@/hooks/useRiskScore';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';

import type { Category, CategoryType } from '../../../types';
import { UNRATED } from '../../../types';

export type PieSegment<T, K extends CategoryType> = {
  value: number;
  title: string;
  color: string;
  category: Category<T, K>;
};

type RatingKeyOptions<T, K extends CategoryType> = {
  categoryKey?: KeyPrefix<'ratings'>;
  categoryOverrideFunction?: (
    catgory: Category<T, K>,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<T, K>;
    value: number;
  }>;
};

export const usePieChartData = <T, K extends CategoryType>(
  categories: Category<T, K>[],
  translationOptions: RatingKeyOptions<T, K>
): PieSegment<T, K>[] => {
  const riskFormatters = useRiskScoreFormatters();
  const ratingFns = useRating(translationOptions.categoryKey);
  const { genericCategoricalPalette } = useColourPalette();
  const { getByValue, getColorClass } = ratingFns;

  if (categories.length < 1) {
    return [];
  }

  const data = categories.map((category, index) => {
    const title = isDate(category.key)
      ? category.label
      : (getByValue(category.key)?.label ?? category.label);

    const color = isDate(category.key)
      ? genericCategoricalPalette(index)
      : category.key === UNRATED
        ? colours['light-grey'].backgroundColor
        : (colours[getColorClass(category.key) as Colour]?.backgroundColor ??
          getColorClass(category.key) ??
          genericCategoricalPalette(index));

    return {
      color,
      title,
      category,
      value: category.aggregatedValue,
      ...translationOptions.categoryOverrideFunction?.(
        category,
        ratingFns,
        riskFormatters
      ),
    };
  });

  if (!data.length) {
    return [];
  }

  return data;
};
