import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetAncestorRiskScoresByRiskIdDocument } from 'generated/graphql';

export const getAncestorRiskScoresByRiskId = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetAncestorRiskScoresByRiskIdDocument>
) => {
  const result = await hasuraClient.query({
    query: GetAncestorRiskScoresByRiskIdDocument,
    variables,
  });

  return result.data;
};
