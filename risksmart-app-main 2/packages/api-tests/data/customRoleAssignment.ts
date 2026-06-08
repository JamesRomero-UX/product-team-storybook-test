import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CustomRoleAssignmentInsertInput } from '../generated/graphql';

const defaultCustomRoleAssignment: CustomRoleAssignmentInsertInput = {
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-02-01T00:00:00Z',
  RoleTypeKey: 'RiskManager',
};

export const buildCustomRoleAssignment = (
  overrides: Partial<CustomRoleAssignmentInsertInput> = {}
): CustomRoleAssignmentInsertInput => {
  return {
    ...defaultCustomRoleAssignment,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    CustomRoleId: randomUUID(),
    ...overrides,
  };
};
