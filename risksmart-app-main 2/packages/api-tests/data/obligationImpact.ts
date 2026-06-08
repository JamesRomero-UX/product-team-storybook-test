import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ObligationImpactInsertInput } from '../generated/graphql';

const defaultObligationImpact: ObligationImpactInsertInput = {
  Description: 'Obligation impact description',
  ImpactRating: 3,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildObligationImpact = (
  overrides: Partial<ObligationImpactInsertInput> = {}
): ObligationImpactInsertInput => {
  return {
    ...defaultObligationImpact,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
