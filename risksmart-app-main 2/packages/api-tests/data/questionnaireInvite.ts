import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { QuestionnaireInviteInsertInput } from '../generated/graphql';

const defaultQuestionnaireInvite: QuestionnaireInviteInsertInput = {
  UserEmail: '',
  ParentId: '',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildQuestionnaireInvite = (
  overrides: Partial<QuestionnaireInviteInsertInput> = {}
): QuestionnaireInviteInsertInput => ({
  ...defaultQuestionnaireInvite,
  Id: randomUUID(),
  UserId: getDefaultUserId(),
  CreatedByUser: getDefaultUserId(),
  ModifiedByUser: getDefaultUserId(),
  OrgKey: getDefaultOrgId(),
  ...overrides,
});
