import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type { InsertChildControlDocument } from 'generated/graphql';
import {
  DeleteControlParentDocument,
  InsertControlParentDocument,
} from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertChildControl = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertChildControlDocument>
) => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  logger.info('Inserting child control');
  const data = await apiClient.insertChildControl(variables);

  return data.insert_control_one?.Id;
};

export const insertControlParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertControlParentDocument>
) => {
  logger.info('Inserting control parent');
  const result = await hasuraClient.mutate({
    mutation: InsertControlParentDocument,
    variables,
  });

  return result.data?.insert_control_parent_one;
};

export const deleteControlParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteControlParentDocument>
) => {
  logger.info('Deleting control parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteControlParentDocument,
    variables,
  });

  return result.data?.delete_control_parent;
};
