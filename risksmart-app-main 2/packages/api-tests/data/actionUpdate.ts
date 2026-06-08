import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ActionUpdateInsertInput } from '../generated/graphql';

const defaultActionUpdate: ActionUpdateInsertInput = {
  Meta: undefined,
  Title: 'Test',
  Description: 'Description',

  CreatedAtTimestamp: undefined,

  ModifiedAtTimestamp: undefined,
};

export const buildActionUpdate = (
  overrides: Partial<ActionUpdateInsertInput> = {}
): ActionUpdateInsertInput => {
  return {
    ...defaultActionUpdate,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
