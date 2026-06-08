import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type { InsertTestInternalAuditResultsWithParentsDocument } from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertInternalAuditTestResultWithParents = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof InsertTestInternalAuditResultsWithParentsDocument
  >
) => {
  logger.info('Inserting test results');
  const apiClient = getRisksmartApiClient(hasuraClient);
  const result =
    await apiClient.insertTestInternalAuditResultsWithParents(variables);

  return result?.insert_control_test_internal_audit_result?.returning.map(
    (c) => c.Id
  );
};
