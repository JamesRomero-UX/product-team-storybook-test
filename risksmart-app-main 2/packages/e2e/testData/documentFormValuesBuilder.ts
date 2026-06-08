import type { DocumentFormValues } from '../models/forms/DocumentForm';

const defaultDocumentFormValues: Partial<DocumentFormValues> = {
  title: 'Document 1',
  purpose: `Document A description`,
  type: 'Policy',
  owners: ['RiskManager1'],
  nextTestOverdue: undefined,
  nextTestDue: undefined,
  testFrequency: 'Weekly',
  timeToCompleteValue: 10,
  timeToCompleteUnit: 'days',
  testScheduleStartDate: '2021-02-02',
};

/**
 * Builds an document from form values object with default values and any provided overrides.
 * @param overrides
 */
export const buildDocumentFormValues = (
  overrides: Partial<DocumentFormValues> = {}
): Partial<DocumentFormValues> => ({
  ...defaultDocumentFormValues,
  ...overrides,
});
