import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { BusinessAreaInsertInput } from '../generated/graphql';

const defaultBusinessArea: BusinessAreaInsertInput = {
  Title: 'Business Area 1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildBusinessArea = (
  overrides: Partial<BusinessAreaInsertInput> = {}
): BusinessAreaInsertInput => {
  return {
    ...defaultBusinessArea,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
