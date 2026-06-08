import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteAcceptanceParentDocument,
  GetAcceptanceDocument,
  InsertAcceptanceDocument,
  InsertAcceptanceParentDocument,
  UpdateAcceptanceDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getAcceptanceById = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetAcceptanceDocument>
) => {
  logger.info('Getting acceptance by id');
  const result = await hasuraClient.query({
    query: GetAcceptanceDocument,
    variables,
  });

  return result.data?.acceptance_by_pk;
};

export const insertAcceptance = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertAcceptanceDocument>
) => {
  logger.info('Inserting child acceptance');
  const result = await hasuraClient.mutate({
    mutation: InsertAcceptanceDocument,
    variables,
  });

  return result.data?.insert_acceptance_one;
};

export const updateAcceptance = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateAcceptanceDocument>
) => {
  logger.info('Updating acceptance');
  const result = await hasuraClient.mutate({
    mutation: UpdateAcceptanceDocument,
    variables,
  });

  return result.data?.update_acceptance;
};

export const insertAcceptanceParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertAcceptanceParentDocument>
) => {
  logger.info('Inserting acceptance parent');
  const result = await hasuraClient.mutate({
    mutation: InsertAcceptanceParentDocument,
    variables,
  });
  if (!result.data?.insert_acceptance_parent?.returning[0]) {
    throw new Error('Failed to insert acceptance parent');
  }

  return result.data.insert_acceptance_parent.returning[0];
};

export const deleteAcceptanceParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteAcceptanceParentDocument>
) => {
  logger.info('Deleting acceptance parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteAcceptanceParentDocument,
    variables,
  });

  return result.data?.delete_acceptance_parent;
};
