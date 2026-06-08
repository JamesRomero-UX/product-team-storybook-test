import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteIndicatorParentDocument,
  InsertIndicatorDocument,
  InsertIndicatorParentDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertChildIndicator = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertIndicatorDocument>
) => {
  logger.info('Inserting indicator');
  const result = await hasuraClient.mutate({
    mutation: InsertIndicatorDocument,
    variables,
  });

  return result.data?.insert_indicator_one?.Id;
};

export const insertIndicatorParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertIndicatorParentDocument>
) => {
  logger.info('Inserting indicator parent');
  const result = await hasuraClient.mutate({
    mutation: InsertIndicatorParentDocument,
    variables,
  });

  return result.data?.insert_indicator_parent_one;
};

export const deleteIndicatorParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteIndicatorParentDocument>
) => {
  logger.info('Deleting Indicator parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteIndicatorParentDocument,
    variables,
  });

  return result.data?.delete_indicator_parent;
};
