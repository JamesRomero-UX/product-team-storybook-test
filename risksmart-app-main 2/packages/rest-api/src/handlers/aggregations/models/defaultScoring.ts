import type { ModelConfig } from './types';

export const modelConfig: ModelConfig<object> = {
  requiresAggregation: false,
  calculateControlEffectiveness: () => {
    return null;
  },
  calculateInherentScore: ({ latestInherentRating }) => {
    return {
      score:
        (latestInherentRating?.Likelihood ?? 0) *
        (latestInherentRating?.Impact ?? 0),
      likelihood: latestInherentRating?.Likelihood ?? 0,
      impact: latestInherentRating?.Impact ?? 0,
    };
  },
  calculateResidualScore: ({ latestResidualRating }) => {
    return (
      (latestResidualRating?.Likelihood ?? 0) *
      (latestResidualRating?.Impact ?? 0)
    );
  },
  calculateResidualRating: ({ latestResidualRating }) => {
    return latestResidualRating?.Rating ?? null;
  },
  calculateInherentRating: ({ latestInherentRating }) => {
    return latestInherentRating?.Rating ?? null;
  },
};
