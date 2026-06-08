import type { QueryConfig } from '../db';
import { modifiedByAndCreatedByUser } from './utils';

export const getQuestionnaireTemplateVersionByIdQueryConfig = {
  columns: {
    Id: true,
    Version: true,
    Status: true,
    ParentId: true,
    Schema: true,
    UISchema: true,
    CreatedByUser: true,
    ModifiedByUser: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    CustomAttributeData: true,
  },
  with: {
    ...modifiedByAndCreatedByUser,
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
  },
} as const satisfies QueryConfig<'questionnaire_template_version'>;
