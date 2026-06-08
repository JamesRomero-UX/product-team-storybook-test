import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IndicatorParentInsertInput } from '../generated/graphql';

const defaultIndicatorParent: IndicatorParentInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIndicatorParent = (
  overrides: Partial<IndicatorParentInsertInput> = {}
): IndicatorParentInsertInput => {
  return {
    ...defaultIndicatorParent,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
