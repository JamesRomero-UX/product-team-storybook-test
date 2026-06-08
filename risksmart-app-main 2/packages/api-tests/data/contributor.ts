import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ContributorInsertInput } from '../generated/graphql';

const defaultContributor: ContributorInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildContributor = (
  overrides: Partial<ContributorInsertInput> = {}
): ContributorInsertInput => {
  return {
    ...defaultContributor,
    OrgKey: getDefaultOrgId(),
    UserId: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
