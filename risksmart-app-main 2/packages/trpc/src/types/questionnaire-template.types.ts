import type { QuestionnaireTemplateVersionStatus } from '@risksmart-app/domain/src/types/consts/index';
import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getQuestionnaireTemplatesQueryConfig } from '@risksmart-app/drizzle/src/queries/questionnaire-template.query';

export type QuestionnaireTemplateRow = InferQueryModel<
  'questionnaire_template',
  typeof getQuestionnaireTemplatesQueryConfig
>;

export type QuestionnaireTemplateRowWithVersions = QuestionnaireTemplateRow & {
  draftVersions: Array<{
    Id: string;
    Status: QuestionnaireTemplateVersionStatus;
    Version: string;
  }>;
  nonDraftVersions: Array<{
    Id: string;
    Status: QuestionnaireTemplateVersionStatus;
    Version: string;
  }>;
  publishedVersion: Array<{
    Id: string;
    Status: QuestionnaireTemplateVersionStatus;
    Version: string;
  }>;
};
