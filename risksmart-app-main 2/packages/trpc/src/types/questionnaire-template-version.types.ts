import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getQuestionnaireTemplateVersionByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/questionnaire-template-version.query';

export type QuestionnaireTemplateVersionById = InferQueryModel<
  'questionnaire_template_version',
  typeof getQuestionnaireTemplateVersionByIdQueryConfig
>;
