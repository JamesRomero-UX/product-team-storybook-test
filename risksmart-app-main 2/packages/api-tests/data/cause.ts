import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CauseInsertInput } from '../generated/graphql';

const defaultCause: CauseInsertInput = {
  Description: 'Description 1',
  Significance: 3,
  Title: 'Cause 1',
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
};

export const buildCause = (
  overrides: Partial<CauseInsertInput> = {}
): CauseInsertInput => {
  return {
    ...defaultCause,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
