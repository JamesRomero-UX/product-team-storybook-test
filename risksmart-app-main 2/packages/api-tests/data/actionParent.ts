import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ActionParentInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const defaultActionParent: ActionParentInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  ParentType: ParentTypeEnum.Risk,
};

export const buildActionParent = (
  overrides: Partial<ActionParentInsertInput> = {}
): ActionParentInsertInput => {
  return {
    ...defaultActionParent,
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
