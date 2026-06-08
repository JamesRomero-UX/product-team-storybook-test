import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ContributorGroupInsertInput } from '../generated/graphql';

const defaultContributorGroup: ContributorGroupInsertInput = {
  UserGroupId: '',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildContributorGroup = (
  overrides: Partial<ContributorGroupInsertInput> = {}
): ContributorGroupInsertInput => {
  return {
    ...defaultContributorGroup,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
