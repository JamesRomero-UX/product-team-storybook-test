import type { ActionFormFields } from '../models/forms/ActionForm';
import { users } from '../users';

const defaultActionFormValues: ActionFormFields = {
  title: 'Action 1',
  description: 'Action 1 description',
  owners: ['ReadOnly1'],
  contributors: [users.standard.friendlyName],
  tags: [],
  departments: [],
  priority: 'Low',
  dateRaised: '2020-01-01',
  targetCloseDate: '2120-01-01',
  status: 'Closed',
  attachFiles: [],
  closedDate: '2025-01-02',
};

export const buildActionFormValues = (
  overrides: Partial<ActionFormFields> = {}
): ActionFormFields => ({
  ...defaultActionFormValues,
  ...overrides,
});
