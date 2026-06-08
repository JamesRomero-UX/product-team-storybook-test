import { describe, expect, it } from 'vitest';

import {
  calculateTrend,
  calculateTrendFromHistory,
  calculateTrendFromResults,
  TrendIndicator,
} from './trendCalculation';

describe('trendCalculation', () => {
  describe('calculateTrend', () => {
    it('should return Increased when current rating is higher than previous', () => {
      expect(calculateTrend(5, 3)).toBe(TrendIndicator.Increased);
    });

    it('should return Decreased when current rating is lower than previous', () => {
      expect(calculateTrend(2, 4)).toBe(TrendIndicator.Decreased);
    });

    it('should return Stable when ratings are equal', () => {
      expect(calculateTrend(3, 3)).toBe(TrendIndicator.Stable);
    });

    it('should return null when current rating is null', () => {
      expect(calculateTrend(null, 3)).toBeNull();
    });

    it('should return null when previous rating is null', () => {
      expect(calculateTrend(3, null)).toBeNull();
    });

    it('should return null when current rating is undefined', () => {
      expect(calculateTrend(undefined, 3)).toBeNull();
    });

    it('should return null when previous rating is undefined', () => {
      expect(calculateTrend(3, undefined)).toBeNull();
    });

    it('should return null when both ratings are null', () => {
      expect(calculateTrend(null, null)).toBeNull();
    });
  });

  describe('calculateTrendFromHistory', () => {
    it('should return Increased when first rating is higher than second', () => {
      const history = [{ rating: 5 }, { rating: 3 }];
      expect(calculateTrendFromHistory(history)).toBe(TrendIndicator.Increased);
    });

    it('should return Decreased when first rating is lower than second', () => {
      const history = [{ rating: 2 }, { rating: 4 }];
      expect(calculateTrendFromHistory(history)).toBe(TrendIndicator.Decreased);
    });

    it('should return Stable when ratings are equal', () => {
      const history = [{ rating: 3 }, { rating: 3 }];
      expect(calculateTrendFromHistory(history)).toBe(TrendIndicator.Stable);
    });

    it('should return null when history has only one item', () => {
      const history = [{ rating: 3 }];
      expect(calculateTrendFromHistory(history)).toBeNull();
    });

    it('should return null when history is empty', () => {
      expect(calculateTrendFromHistory([])).toBeNull();
    });

    it('should return null when history is undefined', () => {
      expect(calculateTrendFromHistory(undefined)).toBeNull();
    });

    it('should only compare first two items in history', () => {
      const history = [{ rating: 5 }, { rating: 3 }, { rating: 10 }];
      expect(calculateTrendFromHistory(history)).toBe(TrendIndicator.Increased);
    });
  });

  describe('calculateTrendFromResults', () => {
    it('should return Increased when first Rating is higher than second', () => {
      const results = [{ Rating: 5 }, { Rating: 3 }];
      expect(calculateTrendFromResults(results)).toBe(TrendIndicator.Increased);
    });

    it('should return Decreased when first Rating is lower than second', () => {
      const results = [{ Rating: 2 }, { Rating: 4 }];
      expect(calculateTrendFromResults(results)).toBe(TrendIndicator.Decreased);
    });

    it('should return Stable when Ratings are equal', () => {
      const results = [{ Rating: 3 }, { Rating: 3 }];
      expect(calculateTrendFromResults(results)).toBe(TrendIndicator.Stable);
    });

    it('should return null when results has only one item', () => {
      const results = [{ Rating: 3 }];
      expect(calculateTrendFromResults(results)).toBeNull();
    });

    it('should return null when results is empty', () => {
      expect(calculateTrendFromResults([])).toBeNull();
    });

    it('should return null when results is undefined', () => {
      expect(calculateTrendFromResults(undefined)).toBeNull();
    });

    it('should handle null Rating values', () => {
      const results = [{ Rating: null }, { Rating: 3 }];
      expect(calculateTrendFromResults(results)).toBeNull();
    });
  });
});
