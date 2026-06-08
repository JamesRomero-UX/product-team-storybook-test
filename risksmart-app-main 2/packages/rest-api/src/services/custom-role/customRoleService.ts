import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  InsertCustomRoleDocument,
  UpdateCustomRoleDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertCustomRole = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertCustomRoleDocument>
) => {
  logger.info('Inserting custom role');
  const result = await hasuraClient.mutate({
    mutation: InsertCustomRoleDocument,
    variables,
  });

  return result.data?.insert_custom_role_one?.Id;
};

export const updateCustomRole = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateCustomRoleDocument>
) => {
  logger.info('Updating custom role');
  const result = await hasuraClient.mutate({
    mutation: UpdateCustomRoleDocument,
    variables,
  });

  return result.data?.update_custom_role?.affected_rows;
};
