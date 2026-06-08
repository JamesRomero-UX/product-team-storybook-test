import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { UpdateApproverResponseDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const updateApproverResponse = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateApproverResponseDocument>
) => {
  logger.info('Updating Approval Response');
  const result = await hasuraClient.mutate({
    mutation: UpdateApproverResponseDocument,
    variables,
  });

  return result.data;
};
