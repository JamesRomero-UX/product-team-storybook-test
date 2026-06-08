import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetIssueAssessmentDocument,
  InsertIssueAssessmentDocument,
  UpdateIssueAssessmentDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertIssueAssessment = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertIssueAssessmentDocument>
) => {
  logger.info('Inserting issue assessment');
  const result = await hasuraClient.mutate({
    mutation: InsertIssueAssessmentDocument,
    variables,
  });

  return result.data?.insert_issue_assessment_one?.ParentIssueId;
};
export const updateIssueAssessment = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateIssueAssessmentDocument>
) => {
  logger.info('Updating issue assessment');
  const result = await hasuraClient.mutate({
    mutation: UpdateIssueAssessmentDocument,
    variables,
  });

  return result.data?.update_issue_assessment;
};

export const getIssueAssessment = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetIssueAssessmentDocument>
) => {
  logger.info('Get issue assessment');
  const result = await hasuraClient.mutate({
    mutation: GetIssueAssessmentDocument,
    variables,
  });

  return result.data?.issue_assessment?.[0];
};
