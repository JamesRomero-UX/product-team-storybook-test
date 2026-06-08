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

export const buildRiskAssessmentResultConfig = (
  overrides?: Partial<RiskAssessmentResultConfigInput>
): RiskAssessmentResultConfigInput => ({
  likelihood: {
    ratings: [
      { title: 'Rare', value: 1, color: 'dark-green' },
      { title: 'Unlikely', value: 2, color: 'light-green' },
      { title: 'Possible', value: 3, color: 'orange' },
      { title: 'Likely', value: 4, color: 'light-red' },
      { title: 'Almost Certain', value: 5, color: 'dark-red' },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: 'blue' },
      { name: 'Operational', color: 'purple' },
      { name: 'Reputational', color: 'teal' },
    ],
    ratings: [
      { title: 'Insignificant', value: 1, color: 'dark-green' },
      { title: 'Minor', value: 2, color: 'light-green' },
      { title: 'Moderate', value: 3, color: 'orange' },
      { title: 'Major', value: 4, color: 'light-red' },
      { title: 'Severe', value: 5, color: 'dark-red' },
    ],
    aggregation: 'average',
  },
  matrix: [
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 1 },
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 2 },
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 2, impact: 1 },
    { title: 'Medium', value: 2, color: 'orange', likelihood: 1, impact: 3 },
    { title: 'Medium', value: 2, color: 'orange', likelihood: 2, impact: 2 },
    { title: 'Medium', value: 2, color: 'orange', likelihood: 2, impact: 3 },
    { title: 'Medium', value: 2, color: 'orange', likelihood: 3, impact: 1 },
    { title: 'Medium', value: 2, color: 'orange', likelihood: 3, impact: 2 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 1, impact: 4 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 1, impact: 5 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 2, impact: 4 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 2, impact: 5 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 3, impact: 3 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 3, impact: 4 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 3, impact: 5 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 4, impact: 1 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 4, impact: 2 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 4, impact: 3 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 5, impact: 1 },
    { title: 'High', value: 3, color: 'light-red', likelihood: 5, impact: 2 },
    {
      title: 'Critical',
      value: 4,
      color: 'dark-red',
      likelihood: 4,
      impact: 4,
    },
    {
      title: 'Critical',
      value: 4,
      color: 'dark-red',
      likelihood: 4,
      impact: 5,
    },
    {
      title: 'Critical',
      value: 4,
      color: 'dark-red',
      likelihood: 5,
      impact: 3,
    },
    {
      title: 'Critical',
      value: 4,
      color: 'dark-red',
      likelihood: 5,
      impact: 4,
    },
    {
      title: 'Critical',
      value: 4,
      color: 'dark-red',
      likelihood: 5,
      impact: 5,
    },
  ],
  ...overrides,
});
