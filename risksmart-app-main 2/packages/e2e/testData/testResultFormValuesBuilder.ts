import type { TestResultFormValues } from '../models/forms/TestResultForm';

const defaultTestResultFormValues: Partial<TestResultFormValues> = {
  title: 'Test Result 1',
  controlTestDetails: 'Test Result 1 description',
  testResult: 'Fully effective',
  testDate: '2023-01-01',
  performedBy: 'RiskManager1',
};

export const buildTestResultFormValues = (
  overrides: Partial<TestResultFormValues> = {}
): Partial<TestResultFormValues> => ({
  ...defaultTestResultFormValues,
  ...overrides,
});
