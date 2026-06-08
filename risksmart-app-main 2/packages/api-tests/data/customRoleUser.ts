import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CustomRoleUserInsertInput } from '../generated/graphql';

const defaultCustomRoleUser: CustomRoleUserInsertInput = {
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-02-01T00:00:00Z',
};

export const buildCustomRoleUser = (
  overrides: Partial<CustomRoleUserInsertInput> = {}
): CustomRoleUserInsertInput => {
  return {
    ...defaultCustomRoleUser,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    CustomRoleId: randomUUID(),
    UserId: getDefaultUserId(),
    ...overrides,
  };
};
