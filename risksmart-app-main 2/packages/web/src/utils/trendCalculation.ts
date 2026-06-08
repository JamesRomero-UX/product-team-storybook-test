/**
 * Trend indicator calculation utilities for comparing ratings/results over time.
 * Used across risk, control, policy, and compliance registers.
 */

export enum TrendIndicator {
  Decreased = 'decreased',
  Increased = 'increased',
  Stable = 'stable',
}

/**
 * Calculate the trend between two numeric ratings.
 * Returns null if there's no previous value to compare against.
 *
 * @param currentRating - The most recent rating value
 * @param previousRating - The previous rating value to compare against
 * @returns TrendIndicator or null if comparison not possible
 */
export const calculateTrend = (
  currentRating: number | null | undefined,
  previousRating: number | null | undefined
): TrendIndicator | null => {
  // Cannot calculate trend without both values
  if (currentRating === null || currentRating === undefined) {
    return null;
  }
  if (previousRating === null || previousRating === undefined) {
    return null;
  }

  if (currentRating > previousRating) {
    return TrendIndicator.Increased;
  }
  if (currentRating < previousRating) {
    return TrendIndicator.Decreased;
  }

  return TrendIndicator.Stable;
};

/**
 * Calculate trend from an array of rating history objects.
 * Expects the array to be ordered with the most recent first.
 *
 * @param ratingHistory - Array of rating objects with a rating property
 * @returns TrendIndicator or null if fewer than 2 ratings exist
 */
export const calculateTrendFromHistory = <
  T extends { rating: number | null | undefined },
>(
  ratingHistory: T[] | undefined
): TrendIndicator | null => {
  if (!ratingHistory || ratingHistory.length < 2) {
    return null;
  }

  const currentRating = ratingHistory[0]?.rating;
  const previousRating = ratingHistory[1]?.rating;

  return calculateTrend(currentRating, previousRating);
};

/**
 * Calculate trend from assessment results array.
 * The array should already be sorted by date descending.
 *
 * @param results - Array of assessment results with Rating property
 * @returns TrendIndicator or null if fewer than 2 results exist
 */
export const calculateTrendFromResults = <
  T extends { Rating?: number | null | undefined },
>(
  results: T[] | undefined
): TrendIndicator | null => {
  if (!results || results.length < 2) {
    return null;
  }

  const currentRating = results[0]?.Rating;
  const previousRating = results[1]?.Rating;

  return calculateTrend(currentRating, previousRating);
};
