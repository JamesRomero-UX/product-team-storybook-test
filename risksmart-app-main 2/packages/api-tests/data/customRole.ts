import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CustomRoleInsertInput } from '../generated/graphql';

const defaultCustomRole: CustomRoleInsertInput = {
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-02-01T00:00:00Z',
  RoleName: 'Custom role 1',
};

export const buildCustomRole = (
  overrides: Partial<CustomRoleInsertInput> = {}
): CustomRoleInsertInput => {
  return {
    ...defaultCustomRole,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
