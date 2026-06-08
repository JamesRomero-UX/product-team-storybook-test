import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { InsertImpactRatingsDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertImpactRatings = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertImpactRatingsDocument>
) => {
  logger.info('Inserting impact rating');
  const result = await hasuraClient.mutate({
    mutation: InsertImpactRatingsDocument,
    variables,
  });

  return result.data?.insert_impact_rating?.returning;
};
