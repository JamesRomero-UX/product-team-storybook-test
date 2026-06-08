import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CommentInsertInput } from '../generated/graphql';

const defaultComment: CommentInsertInput = {
  Content: 'comment content',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildComment = (
  overrides: Partial<CommentInsertInput> = {}
): CommentInsertInput => {
  return {
    ...defaultComment,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
