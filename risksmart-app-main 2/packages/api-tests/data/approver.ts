import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ApproverInsertInput } from '../generated/graphql';

const defaultApprover: ApproverInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildApprover = (
  overrides: Partial<ApproverInsertInput> = {}
): ApproverInsertInput => {
  return {
    ...defaultApprover,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
