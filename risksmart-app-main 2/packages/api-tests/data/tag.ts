import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { TagInsertInput } from '../generated/graphql';

const defaultTag: TagInsertInput = {
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildTag = (
  overrides: Partial<TagInsertInput> = {}
): TagInsertInput => {
  return {
    ...defaultTag,
    TagTypeId: randomUUID(),
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
