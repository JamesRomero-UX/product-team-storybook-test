import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { DepartmentTypeInsertInput } from '../generated/graphql';

const defaultDepartmentType: DepartmentTypeInsertInput = {
  Description: 'Description 1',
  Name: 'Name 1',
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildDepartmentType = (
  overrides: Partial<DepartmentTypeInsertInput> = {}
): DepartmentTypeInsertInput => {
  return {
    ...defaultDepartmentType,
    DepartmentTypeId: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
