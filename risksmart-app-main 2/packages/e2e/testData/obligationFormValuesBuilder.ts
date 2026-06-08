import type { ObligationFormValues } from '../models/forms/ObligationForm';
import { users } from '../users';

const defaultObligationFormValues: Partial<ObligationFormValues> = {
  title: 'Obligation 1',
  interpretation: 'Interpretation 1',
  adherence: 'Flexible',
  owners: [users.riskManager.friendlyName],
  contributors: [users.public.friendlyName],
  testFrequency: 'Weekly',
  type: 'High-level standard',
};

/**
 * Builds an obligation form values object from form values object with default values and any provided overrides.
 * @param overrides
 */
export const buildObligationFormValues = (
  overrides: Partial<ObligationFormValues> = {}
): Partial<ObligationFormValues> => ({
  ...defaultObligationFormValues,
  ...overrides,
});
