import { RiskAssessmentResultControlTypeEnum } from 'generated/graphql';

import { modelConfig } from './defaultScoring';

describe('defaultScoring', () => {
  describe('calculateControlEffectiveness', () => {
    it('should always return null (does not apply to default scoring)', () => {
      const result = modelConfig.calculateControlEffectiveness({
        config: {},
        controls: [],
      });
      expect(result).toEqual(null);
    });
  });

  describe('requiresAggregation', () => {
    it('should always be false', () => {
      expect(modelConfig.requiresAggregation).toEqual(false);
    });
  });

  describe('calculateInherentScore', () => {
    const defaultOptions = {
      config: {},
      riskId: '',
      latestInherentRating: null,
    };

    it('should return 0 when no inherent rating exists', () => {
      const score = modelConfig.calculateInherentScore({
        ...defaultOptions,
        latestInherentRating: null,
      });
      expect(score?.score).toEqual(0);
    });

    it('should return 0 when inherent likelihood has not been set', () => {
      const score = modelConfig.calculateInherentScore({
        ...defaultOptions,
        latestInherentRating: {
          Impact: 2,
          Likelihood: null,
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      });
      expect(score).toEqual({ score: 0, likelihood: 0, impact: 2 });
    });
    it('should return 0 when inherent impact has not been set', () => {
      const score = modelConfig.calculateInherentScore({
        ...defaultOptions,
        latestInherentRating: {
          Impact: null,
          Likelihood: 2,
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      });
      expect(score).toEqual({ score: 0, likelihood: 2, impact: 0 });
    });
    it('should return impact * likelihood', () => {
      const score = modelConfig.calculateInherentScore({
        ...defaultOptions,
        latestInherentRating: {
          Impact: 3,
          Likelihood: 2,
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      });
      expect(score).toEqual({ score: 6, likelihood: 2, impact: 3 });
    });
  });

  describe('calculateResidualScore', () => {
    const defaultOptions = {
      config: {},
      riskId: '',
      inherentScore: null,
      latestResidualRating: null,
      controlEffectiveness: null,
    };

    it('should return 0 when no residual rating exists', () => {
      const score = modelConfig.calculateResidualScore({
        ...defaultOptions,
        latestResidualRating: null,
      });
      expect(score).toEqual(0);
    });

    it('should return 0 when residual likelihood has not been set', () => {
      const score = modelConfig.calculateResidualScore({
        ...defaultOptions,
        latestResidualRating: {
          Impact: 2,
          Likelihood: null,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        },
      });
      expect(score).toEqual(0);
    });
    it('should return 0 when residual impact has not been set', () => {
      const score = modelConfig.calculateResidualScore({
        ...defaultOptions,
        latestResidualRating: {
          Impact: null,
          Likelihood: 2,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        },
      });
      expect(score).toEqual(0);
    });
    it('should return impact * likelihood', () => {
      const score = modelConfig.calculateResidualScore({
        ...defaultOptions,
        latestResidualRating: {
          Impact: 3,
          Likelihood: 2,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        },
      });
      expect(score).toEqual(6);
    });
  });

  describe('calculateResidualRating', () => {
    const defaultOptions = {
      residualScore: 0,
      residualRatingCategories: [],
    };

    it('should return the latest residual rating', () => {
      const score = modelConfig.calculateResidualRating({
        ...defaultOptions,
        latestResidualRating: {
          Rating: 3,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        },
      });
      expect(score).toEqual(3);
    });
  });
  describe('calculateInherentRating', () => {
    const defaultOptions = {
      inherentScore: 0,
      inherentRatingCategories: [],
    };

    it('should return the latest inherent rating', () => {
      const score = modelConfig.calculateInherentRating({
        ...defaultOptions,
        latestInherentRating: {
          Rating: 3,
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      });
      expect(score).toEqual(3);
    });
  });
});
