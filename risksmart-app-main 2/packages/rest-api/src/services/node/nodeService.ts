import type { ApolloClient } from '@apollo/client';
import { GetNodeDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getNode = async (
  hasuraClient: ApolloClient<unknown>,
  id: string
) => {
  logger.info('Requesting node', { id });
  const result = await hasuraClient.query({
    query: GetNodeDocument,
    variables: {
      Id: id,
    },
  });

  return result.data.node_by_pk;
};
