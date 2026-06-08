import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetAssessmentActivityByIdDocument,
  InsertAssessmentActivityDocument,
  UpdateAssessmentActivityDocument,
} from 'generated/graphql';

import { getLogger } from '../logger';
const logger = getLogger();

export const insertAssessmentActivity = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertAssessmentActivityDocument>
) => {
  logger.info('Inserting assessment activity');
  const result = await hasuraClient.mutate({
    mutation: InsertAssessmentActivityDocument,
    variables,
  });

  return result.data?.insert_assessment_activity_one?.Id;
};

export const updateAssessmentActivity = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateAssessmentActivityDocument>
) => {
  logger.info('Updating assessment activity');
  const result = await hasuraClient.mutate({
    mutation: UpdateAssessmentActivityDocument,
    variables,
  });

  return result.data?.update_assessment_activity?.affected_rows;
};

export const getAssessmentActivityWithLinkedItemsById = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetAssessmentActivityByIdDocument>
) => {
  const result = await hasuraClient.query({
    query: GetAssessmentActivityByIdDocument,
    variables,
  });

  return result.data;
};
