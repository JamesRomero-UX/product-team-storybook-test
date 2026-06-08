import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { UserGroupUserInsertInput } from '../generated/graphql';

const defaultUserGroupUser: UserGroupUserInsertInput = {
  UserGroupId: undefined,
  UserId: undefined,

  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildUserGroupUser = (
  overrides: Partial<UserGroupUserInsertInput> = {}
): UserGroupUserInsertInput => {
  return {
    ...defaultUserGroupUser,
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
