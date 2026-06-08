import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import type { KeyPrefix, ParseKeys } from 'i18next';

import type { UseRiskScoreFormattersResponse } from '@/hooks/useRiskScore';

import { useDataSeries as useUnifiedDataSeries } from '../../../hooks/useDataSeries';
import type {
  Category,
  CategoryType,
  UnratedCategoryType,
} from '../../../types';
import type { RadarSeries } from '../types';

type RatingKeyOptions<T, K extends CategoryType, S extends CategoryType> = {
  entityNamePlural: ParseKeys<'common'>;
  category?: KeyPrefix<'ratings'>;
  subCategory?: KeyPrefix<'ratings'>;
  subCategoryOverrideFunction?: (
    category: Category<T, S | UnratedCategoryType>,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<T, S | UnratedCategoryType>;
    value: number;
  }>;
  categoryOverrideFunction?: (
    category: Category<T, K>,
    ratingFns: UseRatingResponse,
    riskFormatters: UseRiskScoreFormattersResponse
  ) => Partial<{
    color: string;
    title: string;
    category: Category<T, K>;
    value: number;
  }>;
};

export const useRadarDataSeries = <
  T,
  K extends CategoryType,
  S extends CategoryType,
>(
  categories: Category<T, K, never | S>[],
  translationOptions: RatingKeyOptions<T, K, never | S>
): RadarSeries<K>[] => {
  return useUnifiedDataSeries(categories, translationOptions, {
    chartType: 'column',
    enablePointColors: true,
  }) as RadarSeries<K>[];
};
