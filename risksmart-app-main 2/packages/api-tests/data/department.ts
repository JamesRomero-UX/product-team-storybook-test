import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { DepartmentInsertInput } from '../generated/graphql';

const defaultDepartment: DepartmentInsertInput = {
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildDepartment = (
  overrides: Partial<DepartmentInsertInput> = {}
): DepartmentInsertInput => {
  return {
    ...defaultDepartment,
    DepartmentTypeId: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
