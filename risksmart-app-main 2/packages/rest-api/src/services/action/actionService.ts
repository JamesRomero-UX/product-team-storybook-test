import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteActionParentDocument,
  InsertActionDocument,
  InsertActionParentDocument,
  InsertChildActionDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertChildAction = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertChildActionDocument>
) => {
  logger.info('Inserting child action');
  const result = await hasuraClient.mutate({
    mutation: InsertChildActionDocument,
    variables,
  });

  return result.data?.insert_action_one?.Id;
};

export const insertAction = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertActionDocument>
) => {
  logger.info('Inserting action');
  const result = await hasuraClient.mutate({
    mutation: InsertActionDocument,
    variables,
  });

  return result.data?.insert_action_one?.Id;
};

export const insertActionParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertActionParentDocument>
) => {
  logger.info('Inserting action parent');
  const result = await hasuraClient.mutate({
    mutation: InsertActionParentDocument,
    variables,
  });

  return result.data?.insert_action_parent_one;
};

export const deleteActionParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteActionParentDocument>
) => {
  logger.info('Deleting action parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteActionParentDocument,
    variables,
  });

  return result.data?.delete_action_parent;
};
