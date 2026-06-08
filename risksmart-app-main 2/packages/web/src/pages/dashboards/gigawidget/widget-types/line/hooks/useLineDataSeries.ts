import type { RatingKeyOptions } from '../../../hooks/useDataSeries';
import { useDataSeries } from '../../../hooks/useDataSeries';
import type { Category, CategoryType } from '../../../types';
import type { LineSeries } from '../types';

/**
 * Hook to generate line chart data series from categories.
 * Converts data series to line chart format for time-based visualization.
 */
export const useLineDataSeries = <
  T,
  K extends CategoryType,
  S extends CategoryType = never,
>(
  categories: Category<T, K, never | S>[],
  translationOptions: RatingKeyOptions<T, K, never | S>
): LineSeries<K>[] => {
  const baseSeries = useDataSeries(categories, translationOptions, {
    chartType: 'line',
  });

  return baseSeries.map((series) => ({
    ...series,
    type: 'line' as const,
  }));
};
