import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { OwnerInsertInput } from '../generated/graphql';

const defaultOwner: OwnerInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildOwner = (
  overrides: Partial<OwnerInsertInput> = {}
): OwnerInsertInput => {
  return {
    ...defaultOwner,
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    UserId: getDefaultUserId(),
    ...overrides,
  };
};
