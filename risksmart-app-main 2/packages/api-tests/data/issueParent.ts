import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IssueParentInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const defaultIssueParent: IssueParentInsertInput = {
  CreatedAtTimestamp: undefined,

  ModifiedAtTimestamp: undefined,
  ParentType: ParentTypeEnum.Risk,
};

export const buildIssueParent = (
  overrides: Partial<IssueParentInsertInput> = {}
): IssueParentInsertInput => {
  return {
    ...defaultIssueParent,
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
