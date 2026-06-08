import type { InsertInternalAuditInput } from '../generated/graphql';

const defaultInternalAudit: InsertInternalAuditInput = {
  BusinessArea: '',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
  Title: '',
};

export const buildInsertInternalAuditInput = (
  overrides: Partial<InsertInternalAuditInput> = {}
): InsertInternalAuditInput => {
  return {
    ...defaultInternalAudit,
    ...overrides,
  };
};
