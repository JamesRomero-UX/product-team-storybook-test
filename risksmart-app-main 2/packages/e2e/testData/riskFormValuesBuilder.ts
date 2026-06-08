import type { RiskFormValues } from '../models/forms/RiskForm';

const requiredRiskFormValues: Partial<RiskFormValues> = {
  riskName: 'Risk 1',
  description: 'Risk 1 description',
};

const defaultRiskFormValues: RiskFormValues = {
  riskName: 'Risk 1',
  description: 'Risk 1 description',
  tier: 'Tier 1',
  treatment: 'Terminate',
  status: 'Active',
  owners: ['ReadOnly1'],
  contributors: ['Standard1'],
  tags: [],
  departments: [],
  testFrequency: 'Weekly',
  parentRiskTitle: undefined,
  nextTestOverdue: undefined,
  nextTestDue: undefined,
  timeToCompleteValue: 2,
  timeToCompleteUnit: 'days',
  testScheduleStartDate: '2023-10-01',
};

/**
 * Builds a risk form values object with default values for all form fields and any provided overrides.
 * @param overrides
 * @returns
 */
export const buildRiskFormValues = (
  overrides: Partial<RiskFormValues> = {}
): RiskFormValues => ({
  ...defaultRiskFormValues,
  ...overrides,
});

/**
 * Builds a risk form values object with only the required fields.
 * This is useful for testing scenarios where only the required fields are needed.
 * @param overrides
 * @returns
 */
export const buildRequiredRiskFormValues = (
  overrides: Partial<RiskFormValues> = {}
): Partial<RiskFormValues> => ({
  ...requiredRiskFormValues,
  ...overrides,
});
