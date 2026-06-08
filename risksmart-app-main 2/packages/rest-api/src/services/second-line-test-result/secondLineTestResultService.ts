import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type { InsertTestSecondLineResultsWithParentsDocument } from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertSecondLineTestResultWithParents = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertTestSecondLineResultsWithParentsDocument>
) => {
  logger.info('Inserting test results');
  const apiClient = getRisksmartApiClient(hasuraClient);
  const result =
    await apiClient.insertTestSecondLineResultsWithParents(variables);

  return result?.insert_control_test_second_line_result?.returning.map(
    (c) => c.Id
  );
};
