import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { QuestionnaireTemplateInsertInput } from '../generated/graphql';
import {
  DeleteQuestionnaireTemplateDocument,
  GetQuestionnaireTemplateDocument,
  InsertQuestionnaireTemplateDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertQuestionnaireTemplates = async (
  variables: VariablesOf<typeof InsertQuestionnaireTemplateDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    mutation: InsertQuestionnaireTemplateDocument,
    context: getContext(options),
  });

export const insertQuestionnaireTemplate = async (
  questionnaireTemplate: QuestionnaireTemplateInsertInput,
  options?: TestQueryOptions
) =>
  insertQuestionnaireTemplates({ objects: [questionnaireTemplate] }, options);

export const deleteQuestionnaireTemplate = async (
  variables: VariablesOf<typeof DeleteQuestionnaireTemplateDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    mutation: DeleteQuestionnaireTemplateDocument,
    context: getContext(options),
  });

export const getQuestionnaireTemplates = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    query: GetQuestionnaireTemplateDocument,
    context: getContext(options),
    variables: {
      where: {},
    },
  });

  return data.questionnaire_template;
};
