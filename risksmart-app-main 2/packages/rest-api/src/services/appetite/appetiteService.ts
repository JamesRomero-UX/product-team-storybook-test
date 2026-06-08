import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type { GetLatestAppetitesForRiskDocument } from 'generated/graphql';
import {
  DeleteAppetiteParentDocument,
  InsertAppetiteParentDocument,
  InsertAppetiteParentsDocument,
} from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertAppetiteParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertAppetiteParentDocument>
) => {
  logger.info('Inserting Appetite parent');
  const result = await hasuraClient.mutate({
    mutation: InsertAppetiteParentDocument,
    variables,
  });

  return result.data?.insert_appetite_parent_one;
};

export const insertAppetiteParents = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertAppetiteParentsDocument>
) => {
  logger.info('Inserting Appetite parents');
  const result = await hasuraClient.mutate({
    mutation: InsertAppetiteParentsDocument,
    variables,
  });

  return result.data?.insert_appetite_parent;
};

export const deleteAppetiteParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteAppetiteParentDocument>
) => {
  logger.info('Deleting Appetite parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteAppetiteParentDocument,
    variables,
  });

  return result.data?.delete_appetite_parent;
};

export const getLatestAppetitesForRisk = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  variables: VariablesOf<typeof GetLatestAppetitesForRiskDocument>
) => {
  logger.info('Getting appetites for risk');
  const result =
    await getRisksmartApiClient(hasuraClient).getLatestAppetitesForRisk(
      variables
    );

  return result.appetite;
};
