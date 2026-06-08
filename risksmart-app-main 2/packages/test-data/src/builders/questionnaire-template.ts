import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildQuestionnaireTemplate = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'questionnaire_template'>>
): InferInsertModel<'questionnaire_template'> => ({
  Id: randomUUID(),
  Title: 'Test Questionnaire Template',
  Description: 'Test questionnaire template description',
  OrgKey: orgkey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CustomAttributeData: null,
  ...overrides,
});
