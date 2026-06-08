import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { calculateAggregatedScoreFromModel } from './calculators';
import type { ModelConfig } from './models/types';
import type { RatingCategory } from './types';

const inherentRatingCategories: RatingCategory[] = [
  { label: 'Very Low', value: 1, range: [0, 2] },
  { label: 'Low', value: 2, range: [2, 4] },
  { label: 'Medium', value: 3, range: [4, 6] },
  { label: 'High', value: 4, range: [6, 8] },
  { label: 'Very High', value: 5, range: [8, 10] },
];

const residualRatingCategories: RatingCategory[] = [
  { label: 'Very Low', value: 1, range: [0, 2] },
  { label: 'Low', value: 2, range: [2, 4] },
  { label: 'Medium', value: 3, range: [4, 6] },
  { label: 'High', value: 4, range: [6, 8] },
  { label: 'Very High', value: 5, range: [8, 10] },
];

// Define a simplified type for risk scores that matches what we actually need
type RiskScore = {
  __typename?: 'risk_score';
  InherentScore?: number | null;
  ResidualScore?: number | null;
  ResidualImpact?: number | null;
  ResidualLikelihood?: number | null;
  InherentImpact?: number | null;
  InherentLikelihood?: number | null;
} | null;

describe('calculateAggregatedScoreFromModel', () => {
  const mockModel = mock<ModelConfig<unknown>>({
    calculateInherentRating: vi.fn().mockReturnValue(3),
    calculateResidualRating: vi.fn().mockReturnValue(2),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Normal cases', () => {
    it('should calculate scores correctly with valid child risk scores', () => {
      const childRiskScores: RiskScore[] = [
        {
          InherentScore: 15,
          ResidualScore: 2,
          ResidualImpact: 2,
          ResidualLikelihood: 1,
          InherentImpact: 3,
          InherentLikelihood: 5,
        },
        {
          InherentScore: 20,
          ResidualScore: 4,
          ResidualImpact: 2,
          ResidualLikelihood: 2,
          InherentImpact: 5,
          InherentLikelihood: 4,
        },
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'test-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'test-risk-id',
        InherentScore: 17.5, // (15 + 20) / 2
        ResidualScore: 3, // (2 + 4) / 2
        ResidualImpact: 2, // (2 + 2) / 2
        ResidualLikelihood: 2, // (1 + 2) / 2
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: 5,
        InherentImpact: 4,
      });
    });

    it('should handle single child risk score', () => {
      const childRiskScores: RiskScore[] = [
        {
          InherentScore: 8,
          ResidualScore: 3,
          ResidualImpact: 4,
          ResidualLikelihood: 5,
          InherentImpact: 6,
          InherentLikelihood: 7,
        },
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'single-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'single-risk-id',
        InherentScore: 8,
        ResidualScore: 3,
        ResidualImpact: 4,
        ResidualLikelihood: 5,
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: 7,
        InherentImpact: 6,
      });
    });
  });

  describe('Edge cases with null values', () => {
    it('should handle array with null risk scores by skipping calculation', () => {
      const childRiskScores: RiskScore[] = [
        null,
        {
          InherentScore: 4,
          ResidualScore: 2,
          ResidualImpact: 3,
          ResidualLikelihood: 4,
          InherentImpact: 5,
          InherentLikelihood: 3,
        },
        null,
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'null-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      // Should calculate scores from non-null values only
      expect(result).toEqual({
        RiskId: 'null-risk-id',
        InherentScore: null,
        ResidualScore: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null,
        InherentImpact: null,
      });
    });

    it('should handle array with all null risk scores', () => {
      const childRiskScores: RiskScore[] = [null, null, null];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'all-null-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'all-null-risk-id',
        InherentScore: null,
        ResidualScore: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null,
        InherentImpact: null,
      });
    });

    it('should handle risk scores with missing InherentScore', () => {
      const childRiskScores: RiskScore[] = [
        {
          InherentScore: null,
          ResidualScore: 2,
          ResidualImpact: 3,
          ResidualLikelihood: 4,
          InherentImpact: 5,
          InherentLikelihood: 3,
        },
        {
          InherentScore: 6,
          ResidualScore: 4,
          ResidualImpact: 5,
          ResidualLikelihood: 6,
          InherentImpact: 4,
          InherentLikelihood: 2,
        },
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'missing-inherent-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'missing-inherent-risk-id',
        InherentScore: null, // Should be null due to missing inherent score
        ResidualScore: 3, // (2 + 4) / 2
        ResidualImpact: 4, // (3 + 5) / 2
        ResidualLikelihood: 5, // (4 + 6) / 2
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null,
        InherentImpact: null,
      });
    });

    it('should handle risk scores with missing ResidualScore', () => {
      const childRiskScores: RiskScore[] = [
        {
          InherentScore: null,
          ResidualScore: null,
          ResidualImpact: null,
          ResidualLikelihood: null,
          InherentImpact: null,
          InherentLikelihood: null,
        },
        {
          InherentScore: 6,
          ResidualScore: 4,
          ResidualImpact: 5,
          ResidualLikelihood: 6,
          InherentImpact: 5,
          InherentLikelihood: 3,
        },
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'missing-residual-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'missing-residual-risk-id',
        InherentScore: null, // Should be null due to missing inherent score
        ResidualScore: null, // Should be null due to missing residual score
        ResidualImpact: null, // Should be null due to missing residual impact
        ResidualLikelihood: null, // Should be null due to missing residual likelihood
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null, // Should be null due to missing inherent likelihood
        InherentImpact: null, // Should be null due to missing inherent impact
      });
    });

    it('should handle risk scores with undefined values', () => {
      const childRiskScores: RiskScore[] = [
        {
          InherentScore: undefined,
          ResidualScore: undefined,
          ResidualImpact: undefined,
          ResidualLikelihood: undefined,
          InherentImpact: undefined,
          InherentLikelihood: undefined,
        },
        {
          InherentScore: 6,
          ResidualScore: 4,
          ResidualImpact: 5,
          ResidualLikelihood: 6,
          InherentImpact: 5,
          InherentLikelihood: 3,
        },
      ];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'undefined-values-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'undefined-values-risk-id',
        InherentScore: null, // Should be null due to undefined inherent score
        ResidualScore: null, // Should be null due to undefined residual score
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null, // Should be null due to undefined inherent likelihood
        InherentImpact: null, // Should be null due to undefined inherent impact
      });
    });
  });

  describe('Empty and boundary cases', () => {
    it('should handle empty array', () => {
      const childRiskScores: RiskScore[] = [];

      const result = calculateAggregatedScoreFromModel({
        childRiskScores,
        riskId: 'empty-array-risk-id',
        model: mockModel,
        inherentRatingCategories,
        residualRatingCategories,
      });

      expect(result).toEqual({
        RiskId: 'empty-array-risk-id',
        InherentScore: null, // Division by zero should result in null
        ResidualScore: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentRating: 3,
        ResidualRating: 2,
        InherentLikelihood: null,
        InherentImpact: null,
      });
    });
  });
});
