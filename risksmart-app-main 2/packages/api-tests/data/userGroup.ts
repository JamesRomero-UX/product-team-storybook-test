import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { UserGroupInsertInput } from '../generated/graphql';

const defaultUserGroup: UserGroupInsertInput = {
  Name: 'Group 1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildUserGroup = (
  overrides: Partial<UserGroupInsertInput> = {}
): UserGroupInsertInput => {
  return {
    ...defaultUserGroup,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
