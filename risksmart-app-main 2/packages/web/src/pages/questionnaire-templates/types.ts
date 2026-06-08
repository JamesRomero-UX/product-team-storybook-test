import type {
  GetQuestionnaireTemplatesQuery,
  GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type QuestionnaireTemplateFields = CollectionData<
  GetQuestionnaireTemplatesQuery['questionnaire_template'][number]
>;

export type QuestionnaireTemplateRegisterFields =
  QuestionnaireTemplateFields & {
    CreatedByFriendlyName: string;
    ModifiedByFriendlyName: string;
    LatestStatus: string;
  };

export type QuestionnaireTemplateVersionFields = CollectionData<
  GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery['questionnaire_template_version'][number]
>;

export type QuestionnaireTemplateVersionRegisterFields =
  QuestionnaireTemplateVersionFields & {
    CreatedByFriendlyName: string;
    ModifiedByFriendlyName: string;
    StatusLabelled: string;
  };
