import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { QuestionnaireTemplateVersionInsertInput } from '../generated/graphql';
import { QuestionnaireTemplateVersionStatusEnum } from '../generated/graphql';

const defaultQuestionnaireTemplateVersion: QuestionnaireTemplateVersionInsertInput =
  {
    Version: '0.1',
    Status: QuestionnaireTemplateVersionStatusEnum.Published,
    UISchema: {},
    Schema: {},
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
  };

export const buildQuestionnaireTemplateVersion = (
  overrides: Partial<QuestionnaireTemplateVersionInsertInput> = {}
): QuestionnaireTemplateVersionInsertInput => ({
  ...defaultQuestionnaireTemplateVersion,
  Id: randomUUID(),
  CreatedByUser: getDefaultUserId(),
  ModifiedByUser: getDefaultUserId(),
  OrgKey: getDefaultOrgId(),
  ...overrides,
});
