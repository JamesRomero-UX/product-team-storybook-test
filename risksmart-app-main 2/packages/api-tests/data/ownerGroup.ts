import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { OwnerGroupInsertInput } from '../generated/graphql';

const defaultOwnerGroup: OwnerGroupInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildOwnerGroup = (
  overrides: Partial<OwnerGroupInsertInput> = {}
): OwnerGroupInsertInput => {
  return {
    ...defaultOwnerGroup,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
