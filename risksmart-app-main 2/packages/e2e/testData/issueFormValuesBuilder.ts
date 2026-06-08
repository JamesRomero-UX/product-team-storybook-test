import type { IssueFormFields } from '../models/forms/IssueForm';

const defaultIssueFormValues: IssueFormFields = {
  title: 'Issue 1',
  details: 'Issue description 1',
  dateIdentified: '2020-01-01',
  dateOccurred: '2020-01-01',
  attachFiles: [],
  tags: [],
  departments: [],
  impactsCustomer: 'Yes',
  isExternalIssue: 'External',
  owners: ['RiskManager1'],
  contributors: [],
};

/**
 * Builds an issue from form values object with default values and any provided overrides.
 * @param overrides
 */
export const buildIssueFormValues = (
  overrides: Partial<IssueFormFields> = {}
): IssueFormFields => ({
  ...defaultIssueFormValues,
  ...overrides,
});
