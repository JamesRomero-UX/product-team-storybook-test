import type { InsertIssueInput } from '../generated/graphql';

const defaultChildIssue: InsertIssueInput = {
  Title: 'Issue Tile',
  Details: 'Issue description',
  DateOccurred: '2020-01-01',
  DateIdentified: '2020-01-02',
  ImpactsCustomer: false,
  IsExternalIssue: false,
  DepartmentTypeIds: [],
  TagTypeIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  Type: 'issue',
};

export const buildChildIssue = (
  overrides: Partial<InsertIssueInput> = {}
): InsertIssueInput => {
  return {
    ...defaultChildIssue,
    ...overrides,
  };
};
