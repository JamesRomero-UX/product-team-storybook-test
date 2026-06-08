import type {
  CalculateControlEffectivenessFn,
  CalculateInherentRatingFn,
  CalculateInherentScoreFn,
  CalculateResidualRatingFn,
  CalculateResidualScoreFn,
} from '../types';

export interface ModelConfig<T> {
  requiresAggregation: boolean;
  calculateControlEffectiveness: CalculateControlEffectivenessFn<T>;
  calculateInherentScore: CalculateInherentScoreFn<T>;
  calculateResidualScore: CalculateResidualScoreFn;
  calculateResidualRating: CalculateResidualRatingFn;
  calculateInherentRating: CalculateInherentRatingFn;
}
