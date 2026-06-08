import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ControlParentInsertInput } from '../generated/graphql';

const defaultControlParent: ControlParentInsertInput = {
  ControlId: '',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  ParentId: '',
};

export const buildControlParent = (
  overrides: Partial<ControlParentInsertInput> = {}
): ControlParentInsertInput => {
  return {
    ...defaultControlParent,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
