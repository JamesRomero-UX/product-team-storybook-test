import type { RatingOption } from '@risksmart-app/components/src/hooks/types';
import { vi } from 'vitest';

import {
  cellData,
  columnSummaryCellData,
  getBackgroundValue,
  getColumnSummaryBackgroundValue,
  getSuggestion,
  totalAggregatedScoreAcrossAllRisks,
  totalLikelihoodScoreAcrossAllRisks,
  totalRiskImpactRating,
  totalSingleImpactScoreAcrossAllRisks,
} from './placematWidgetUtils';

const mockRatingOptions: RatingOption[] = [
  { label: 'Crucial', value: -8, color: 'red' },
  { label: 'Severe', value: -6, color: 'orange' },
  { label: 'Uncomfortable', value: -4, color: 'yellow' },
  { label: 'Minimal', value: -2, color: 'light-green' },
  { label: 'Acceptable', value: 0, color: 'green' },
  { label: 'Opportunity', value: 2, color: 'blue' },
];

describe('placematWidgetUtils', () => {
  describe('getSuggestion', () => {
    it('should return "ACTION" when value is less than -1', () => {
      expect(getSuggestion(-2)).toBe('ACTION');
    });

    it('should return "OPPORTUNITY" when value is greater than 2', () => {
      expect(getSuggestion(3)).toBe('OPPORTUNITY');
    });

    it('should return "ALIGNED" when value is between -1 and 2 inclusive', () => {
      expect(getSuggestion(-1)).toBe('ALIGNED');
      expect(getSuggestion(0)).toBe('ALIGNED');
      expect(getSuggestion(1)).toBe('ALIGNED');
      expect(getSuggestion(2)).toBe('ALIGNED');
    });
  });

  describe('getBackgroundValue', () => {
    it('should return -4 when value is less than -4', () => {
      expect(getBackgroundValue(-5)).toBe(-4);
    });

    it('should return 4 when value is greater than 4', () => {
      expect(getBackgroundValue(5)).toBe(4);
    });

    it('should return the original value when it is between -4 and 4 inclusive', () => {
      expect(getBackgroundValue(-4)).toBe(-4);
      expect(getBackgroundValue(-3)).toBe(-3);
      expect(getBackgroundValue(0)).toBe(0);
      expect(getBackgroundValue(3)).toBe(3);
      expect(getBackgroundValue(4)).toBe(4);
    });
  });

  describe('cellData', () => {
    const mockGetPlacematColor = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      mockGetPlacematColor.mockImplementation((value) => `color-${value}`);
    });

    it('should return basic cell data without special flags', () => {
      const result = cellData({
        getPlacematColor: mockGetPlacematColor,
        value: 2,
        label: 'Test Label',
      });

      expect(result).toEqual({
        value: 2,
        background: 'color-2',
        label: 'Test Label',
      });
      expect(mockGetPlacematColor).toHaveBeenCalledWith(2);
    });

    it('should handle aggregate suggestion', () => {
      const result = cellData({
        getPlacematColor: mockGetPlacematColor,
        value: 3,
        label: 'Test Label',
        isAggregateSuggestion: true,
      });

      expect(result).toEqual({
        value: 'OPPORTUNITY',
        background: 'color-3',
        label: 'Test Label',
      });
    });
  });

  describe('getColumnSummaryBackgroundValue', () => {
    it('should return "crucial" color when value is less than or equal to crucial threshold', () => {
      expect(getColumnSummaryBackgroundValue(-10, mockRatingOptions)).toBe(
        'red'
      );
      expect(getColumnSummaryBackgroundValue(-8, mockRatingOptions)).toBe(
        'red'
      );
    });

    it('should return "severe" color when value is less than or equal to severe threshold but greater than crucial', () => {
      expect(getColumnSummaryBackgroundValue(-7, mockRatingOptions)).toBe(
        'orange'
      );
      expect(getColumnSummaryBackgroundValue(-6, mockRatingOptions)).toBe(
        'orange'
      );
    });

    it('should return "uncomfortable" color when value is less than or equal to uncomfortable threshold but greater than severe', () => {
      expect(getColumnSummaryBackgroundValue(-5, mockRatingOptions)).toBe(
        'yellow'
      );
      expect(getColumnSummaryBackgroundValue(-4, mockRatingOptions)).toBe(
        'yellow'
      );
    });

    it('should return "minimal" color when value is less than or equal to minimal threshold but greater than uncomfortable', () => {
      expect(getColumnSummaryBackgroundValue(-3, mockRatingOptions)).toBe(
        'light-green'
      );
      expect(getColumnSummaryBackgroundValue(-2, mockRatingOptions)).toBe(
        'light-green'
      );
    });

    it('should return "opportunity" color when value is greater than or equal to opportunity threshold', () => {
      expect(getColumnSummaryBackgroundValue(2, mockRatingOptions)).toBe(
        'blue'
      );
      expect(getColumnSummaryBackgroundValue(5, mockRatingOptions)).toBe(
        'blue'
      );
    });

    it('should return "acceptable" color when no other conditions are met', () => {
      expect(getColumnSummaryBackgroundValue(-1, mockRatingOptions)).toBe(
        'green'
      );
      expect(getColumnSummaryBackgroundValue(0, mockRatingOptions)).toBe(
        'green'
      );
      expect(getColumnSummaryBackgroundValue(1, mockRatingOptions)).toBe(
        'green'
      );
    });
  });

  describe('columnSummaryCellData', () => {
    it('should return cell data with correct format', () => {
      const result = columnSummaryCellData({
        options: mockRatingOptions,
        value: -3,
        label: 'Test Label',
      });

      expect(result).toEqual({
        value: -3,
        background: 'light-green',
        label: 'Test Label',
      });
    });
  });

  describe('totalRiskImpactRating', () => {
    it('should return 0 for empty ratings object', () => {
      const ratings = {};
      expect(totalRiskImpactRating(ratings)).toBe(0);
    });

    it('should sum all rating values correctly', () => {
      const ratings = {
        impact1: 2,
        impact2: -1,
        impact3: 3,
      };
      expect(totalRiskImpactRating(ratings)).toBe(4);
    });

    it('should handle negative values', () => {
      const ratings = {
        impact1: -2,
        impact2: -3,
      };
      expect(totalRiskImpactRating(ratings)).toBe(-5);
    });

    it('should handle single rating', () => {
      const ratings = {
        impact1: 5,
      };
      expect(totalRiskImpactRating(ratings)).toBe(5);
    });
  });

  describe('totalSingleImpactScoreAcrossAllRisks', () => {
    it('should return 0 for empty placematRatings', () => {
      const placematRatings = {};
      expect(
        totalSingleImpactScoreAcrossAllRisks('impact1', placematRatings)
      ).toBe(0);
    });

    it('should sum specific impact scores across all risks', () => {
      const placematRatings = {
        risk1: {
          riskName: 'risk1',
          ratings: { impact1: 2, impact2: 1 },
          likelihood: 1,
        },
        risk2: {
          riskName: 'risk2',
          ratings: { impact1: 3, impact3: 2 },
          likelihood: 2,
        },
      };
      expect(
        totalSingleImpactScoreAcrossAllRisks('impact1', placematRatings)
      ).toBe(5);
    });

    it('should handle missing impact in some risks', () => {
      const placematRatings = {
        risk1: { riskName: 'risk1', ratings: { impact1: 2 }, likelihood: 1 },
        risk2: { riskName: 'risk2', ratings: { impact2: 1 }, likelihood: 1 },
      };
      expect(
        totalSingleImpactScoreAcrossAllRisks('impact1', placematRatings)
      ).toBe(2);
    });

    it('should handle negative impact values', () => {
      const placematRatings = {
        risk1: { riskName: 'risk1', ratings: { impact1: -2 }, likelihood: 1 },
        risk2: { riskName: 'risk2', ratings: { impact1: -3 }, likelihood: 1 },
      };
      expect(
        totalSingleImpactScoreAcrossAllRisks('impact1', placematRatings)
      ).toBe(-5);
    });
  });

  describe('totalLikelihoodScoreAcrossAllRisks', () => {
    it('should return 0 for empty placematRatings', () => {
      const placematRatings = {};
      expect(totalLikelihoodScoreAcrossAllRisks(placematRatings)).toBe(0);
    });

    it('should sum likelihood values across all risks', () => {
      const placematRatings = {
        risk1: { ratings: {}, likelihood: 2, riskName: 'Risk 1' },
        risk2: { ratings: {}, likelihood: 3, riskName: 'Risk 2' },
        risk3: { ratings: {}, likelihood: -1, riskName: 'Risk 3' },
      };
      expect(totalLikelihoodScoreAcrossAllRisks(placematRatings)).toBe(4);
    });

    it('should handle single risk', () => {
      const placematRatings = {
        risk1: { ratings: {}, likelihood: 5, riskName: 'Risk 1' },
      };
      expect(totalLikelihoodScoreAcrossAllRisks(placematRatings)).toBe(5);
    });

    it('should handle all negative likelihood values', () => {
      const placematRatings = {
        risk1: { ratings: {}, likelihood: -2, riskName: 'Risk 1' },
        risk2: { ratings: {}, likelihood: -3, riskName: 'Risk 2' },
      };
      expect(totalLikelihoodScoreAcrossAllRisks(placematRatings)).toBe(-5);
    });
  });

  describe('totalAggregatedScoreAcrossAllRisks', () => {
    it('should return 0 for empty placematRatings', () => {
      const placematRatings = {};
      expect(totalAggregatedScoreAcrossAllRisks(placematRatings)).toBe(0);
    });

    it('should sum all impact ratings and likelihood for a single risk', () => {
      const placematRatings = {
        risk1: {
          ratings: { impact1: 2, impact2: 3 },
          likelihood: 1,
          riskName: 'Risk 1',
        },
      };
      expect(totalAggregatedScoreAcrossAllRisks(placematRatings)).toBe(6);
    });
    it('should sum all impact ratings and likelihood across multiple risks', () => {
      const placematRatings = {
        risk1: {
          ratings: { impact1: 2, impact2: 1 },
          likelihood: 1,
          riskName: 'Risk 1',
        },
        risk2: {
          ratings: { impact1: -1, impact2: 2 },
          likelihood: 2,
          riskName: 'Risk 2',
        },
      };
      expect(totalAggregatedScoreAcrossAllRisks(placematRatings)).toBe(7);
    });
    it('should handle impacts not associated with certain risks', () => {
      const placematRatings = {
        risk1: {
          ratings: { impact1: 2, impact2: 1 },
          likelihood: 1,
          riskName: 'Risk 1',
        },
        risk2: {
          ratings: { impact1: -1 },
          likelihood: 2,
          riskName: 'Risk 2',
        },
      };
      expect(totalAggregatedScoreAcrossAllRisks(placematRatings)).toBe(5);
    });

    it('should handle negative values correctly', () => {
      const placematRatings = {
        risk1: {
          ratings: { impact1: -2, impact2: -3 },
          likelihood: -1,
          riskName: 'Risk 1',
        },
      };
      expect(totalAggregatedScoreAcrossAllRisks(placematRatings)).toBe(-6);
    });
  });
});
