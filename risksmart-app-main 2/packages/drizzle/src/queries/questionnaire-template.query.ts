import type { QueryConfig } from '../db';
import {
  ancestorContributors,
  modifiedByAndCreatedByUser,
  ownersAndContributors,
  tagsAndDepartments,
} from './utils';

export const getQuestionnaireTemplatesQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    ModifiedByUser: true,
    CreatedByUser: true,
    CustomAttributeData: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...modifiedByAndCreatedByUser,
    ...ancestorContributors,
  },
} as const satisfies QueryConfig<'questionnaire_template'>;
