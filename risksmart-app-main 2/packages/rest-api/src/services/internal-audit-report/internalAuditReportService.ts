import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetInternalAuditReportByIdDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getInternalAuditReport = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetInternalAuditReportByIdDocument>
) => {
  logger.info('Getting InternalAuditReport');
  const result = await hasuraClient.query({
    query: GetInternalAuditReportByIdDocument,
    variables,
  });

  return result.data;
};
