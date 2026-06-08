import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ConversationInsertInput } from '../generated/graphql';

const defaultConversation: ConversationInsertInput = {
  CreatedAtTimestamp: undefined,

  ModifiedAtTimestamp: undefined,
};

export const buildConversation = (
  overrides: Partial<ConversationInsertInput> = {}
): ConversationInsertInput => {
  return {
    ...defaultConversation,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
