import { QuestionnaireTemplateVersionStatus } from '@risksmart-app/domain/src/types/consts/questionnaire-template-version-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildQuestionnaireTemplateVersion = ({
  orgKey,
  userId,
  parentId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'questionnaire_template_version'>>;
}): InferInsertModel<'questionnaire_template_version'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Version: '1.0',
  Status: QuestionnaireTemplateVersionStatus.Draft,
  Schema: {},
  UISchema: {},
  ParentId: parentId,
  CustomAttributeData: null,
  ...overrides,
});
