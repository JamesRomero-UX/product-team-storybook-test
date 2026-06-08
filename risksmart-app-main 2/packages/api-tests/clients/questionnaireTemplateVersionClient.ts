import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { QuestionnaireTemplateVersionInsertInput } from '../generated/graphql';
import {
  DeleteQuestionnaireTemplateVersionDocument,
  InsertQuestionnaireTemplateVersionDocument,
  UpdateQuestionnaireTemplateVersionDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertQuestionnaireTemplateVersions = async (
  variables: VariablesOf<typeof InsertQuestionnaireTemplateVersionDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    mutation: InsertQuestionnaireTemplateVersionDocument,
    context: getContext(options),
  });

export const insertQuestionnaireTemplateVersion = async (
  questionnaireTemplateVersion: QuestionnaireTemplateVersionInsertInput,
  options?: TestQueryOptions
) =>
  insertQuestionnaireTemplateVersions(
    { objects: [questionnaireTemplateVersion] },
    options
  );

export const deleteQuestionnaireTemplateVersion = async (
  variables: VariablesOf<typeof DeleteQuestionnaireTemplateVersionDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    mutation: DeleteQuestionnaireTemplateVersionDocument,
    context: getContext(options),
  });

export const updateQuestionnaireTemplateVersion = async (
  variables: VariablesOf<typeof UpdateQuestionnaireTemplateVersionDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    mutation: UpdateQuestionnaireTemplateVersionDocument,
    context: getContext(options),
  });
