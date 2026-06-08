import type { ControlFormValues } from '../models/forms/ControlForm';

const defaultControlFormValues: Partial<ControlFormValues> = {
  type: 'Directive',
  title: 'Control 1',
  description: 'Control description 1',
  owners: ['RiskManager1'],
  tags: [],
  departments: [],
  contributors: [],
};

export const buildControlFormValues = (
  overrides: Partial<ControlFormValues> = {}
): Partial<ControlFormValues> => ({
  ...defaultControlFormValues,
  ...overrides,
});
