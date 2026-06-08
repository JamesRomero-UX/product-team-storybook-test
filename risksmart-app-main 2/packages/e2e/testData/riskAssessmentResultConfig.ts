interface RatingInput {
  title: string;
  description?: string;
  value: number;
  color: string;
}

interface CategoryInput {
  name: string;
  color: string;
}

interface MatrixCellInput {
  title: string;
  value: number;
  color: string;
  likelihood: number;
  impact: number;
}

export interface RiskAssessmentResultConfigInput {
  likelihood: { ratings: RatingInput[] };
  impact: {
    categories: CategoryInput[];
    ratings: RatingInput[];
    aggregation: 'average' | 'maximum';
  };
  matrix: MatrixCellInput[];
}

/**
 * Builds a scoring config with labels completely distinct from taxonomy defaults.
 *
 * Taxonomy uses: Rare/Unlikely/Possible/Likely/Certain (likelihood), Insignificant/Low/Moderate/High/Severe (impact)
 * This builder uses: Improbable/Doubtful/Feasible/Expected/Inevitable (likelihood),
 *                    Negligible/Marginal/Significant/Serious/Catastrophic (impact)
 * Rating levels: Green/Yellow/Orange/Red (vs taxonomy Low/Moderate/High/Critical)
 *
 * This ensures that if tests pass with these labels, the scoring settings path MUST be active.
 */
export const buildScoringConfig = (): RiskAssessmentResultConfigInput => ({
  likelihood: {
    ratings: [
      { title: 'Improbable', value: 1, color: '#22c55e' },
      { title: 'Doubtful', value: 2, color: '#84cc16' },
      { title: 'Feasible', value: 3, color: '#eab308' },
      { title: 'Expected', value: 4, color: '#f97316' },
      { title: 'Inevitable', value: 5, color: '#ef4444' },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: '#3b82f6' },
      { name: 'Operational', color: '#8b5cf6' },
      { name: 'Reputational', color: '#14b8a6' },
    ],
    ratings: [
      { title: 'Negligible', value: 1, color: '#22c55e' },
      { title: 'Marginal', value: 2, color: '#84cc16' },
      { title: 'Significant', value: 3, color: '#eab308' },
      { title: 'Serious', value: 4, color: '#f97316' },
      { title: 'Catastrophic', value: 5, color: '#ef4444' },
    ],
    aggregation: 'average',
  },
  matrix: [
    // Green (value 1): low scores
    { title: 'Green', value: 1, color: '#22c55e', likelihood: 1, impact: 1 },
    { title: 'Green', value: 1, color: '#22c55e', likelihood: 1, impact: 2 },
    { title: 'Green', value: 1, color: '#22c55e', likelihood: 2, impact: 1 },

    // Yellow (value 2): low-medium scores
    { title: 'Yellow', value: 2, color: '#eab308', likelihood: 1, impact: 3 },
    { title: 'Yellow', value: 2, color: '#eab308', likelihood: 2, impact: 2 },
    { title: 'Yellow', value: 2, color: '#eab308', likelihood: 2, impact: 3 },
    { title: 'Yellow', value: 2, color: '#eab308', likelihood: 3, impact: 1 },
    { title: 'Yellow', value: 2, color: '#eab308', likelihood: 3, impact: 2 },

    // Orange (value 3): medium-high scores
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 1, impact: 4 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 1, impact: 5 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 2, impact: 4 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 2, impact: 5 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 3, impact: 3 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 3, impact: 4 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 3, impact: 5 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 4, impact: 1 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 4, impact: 2 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 4, impact: 3 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 5, impact: 1 },
    { title: 'Orange', value: 3, color: '#f97316', likelihood: 5, impact: 2 },

    // Red (value 4): high scores
    { title: 'Red', value: 4, color: '#ef4444', likelihood: 4, impact: 4 },
    { title: 'Red', value: 4, color: '#ef4444', likelihood: 4, impact: 5 },
    { title: 'Red', value: 4, color: '#ef4444', likelihood: 5, impact: 3 },
    { title: 'Red', value: 4, color: '#ef4444', likelihood: 5, impact: 4 },
    { title: 'Red', value: 4, color: '#ef4444', likelihood: 5, impact: 5 },
  ],
});
