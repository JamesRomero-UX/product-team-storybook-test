import type { FindingFormFields } from '../models/forms/FindingForm';

const defaultRiskRatingFindingFormValues: Partial<FindingFormFields> = {
  type: 'Rating',
  ratingType: 'Risk',
  likelihood: 'Likely',
  impact: 'Moderate',
  rating: 'Low',
  resultDate: '2021-03-03',
  controlType: 'Residual',
};

export const buildRiskRatingFindingFormValues = (
  overrides: Partial<FindingFormFields> = {}
): Partial<FindingFormFields> => ({
  ...defaultRiskRatingFindingFormValues,
  ...overrides,
});
