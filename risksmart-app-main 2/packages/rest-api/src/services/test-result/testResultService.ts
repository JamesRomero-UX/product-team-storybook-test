import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type {
  GetTestResultWithParentsByIdDocument,
  InsertTestResultsWithParentsDocument,
} from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertTestResultWithParents = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertTestResultsWithParentsDocument>
) => {
  logger.info('Inserting test results');
  const apiClient = getRisksmartApiClient(hasuraClient);
  const result = await apiClient.insertTestResultsWithParents(variables);

  return result?.insert_test_result?.returning.map((c) => c.Id);
};

export const getTestResultByIdWithParents = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetTestResultWithParentsByIdDocument>
) => {
  logger.info('Getting TestResult');
  const apiClient = getRisksmartApiClient(hasuraClient);
  const result = await apiClient.getTestResultWithParentsById(variables);

  return result?.test_result;
};
