import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { TagTypeInsertInput } from '../generated/graphql';

const defaultTagType: TagTypeInsertInput = {
  Description: 'Description 1',
  Name: 'Name 1',
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildTagType = (
  overrides: Partial<TagTypeInsertInput> = {}
): TagTypeInsertInput => {
  return {
    ...defaultTagType,
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    TagTypeId: randomUUID(),
    ...overrides,
  };
};
