import type { ScoringSettingsData } from './useRiskScoringSettingsStore';

/**
 * Transforms Zustand store state to API config format for the risk assessment result configuration.
 * Returns a config object compatible with the jsonb Config field in the database.
 */
export const transformToApiConfig = (
  state: Omit<ScoringSettingsData, 'id' | 'originalTimestamp'>
) => {
  return {
    likelihood: {
      ratings: state.likelihoodLevels.map((level) => ({
        title: level.title,
        description: level.description || undefined,
        value: level.value,
        color: level.color,
      })),
    },
    impact: {
      ratings: state.impactLevels.map((level) => ({
        title: level.title,
        description: level.description || undefined,
        value: level.value,
        color: level.color,
      })),
      categories: state.impactCategories.map((cat) => ({
        name: cat.name,
        color: cat.color,
      })),
      aggregation: state.impactAggregation,
    },
    matrix: state.matrix.map((entry) => ({
      title: entry.title,
      value: entry.value,
      color: entry.color,
      likelihood: entry.likelihood,
      impact: entry.impact,
    })),
  };
};
