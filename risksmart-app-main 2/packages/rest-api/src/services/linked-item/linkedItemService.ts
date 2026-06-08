import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteLinkedItemsDocument,
  GetLinkedItemsBySourceAndTargetDocument,
  GetLinkedItemsDocument,
  InsertLinkedItemDocument,
  InsertLinkedItemsDocument,
  LinkItemsDocument,
  UnlinkItemsDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const linkItems = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof LinkItemsDocument>
) => {
  const result = await hasuraClient.mutate({
    mutation: LinkItemsDocument,
    variables,
  });

  return result.data?.linkItems;
};

export const unlinkItems = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UnlinkItemsDocument>
) => {
  const result = await hasuraClient.mutate({
    mutation: UnlinkItemsDocument,
    variables,
  });

  return result.data?.unlinkItems;
};

export const getLinkedItemsBySourceAndTarget = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetLinkedItemsBySourceAndTargetDocument>
) => {
  logger.info('Getting linked items by source and target');
  const result = await hasuraClient.mutate({
    mutation: GetLinkedItemsBySourceAndTargetDocument,
    variables,
  });

  return result.data?.linked_item;
};

export const getLinkedItems = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetLinkedItemsDocument>
) => {
  logger.info('Getting linked item');
  const result = await hasuraClient.mutate({
    mutation: GetLinkedItemsDocument,
    variables,
  });

  return result.data?.linked_item;
};

export const insertLinkedItem = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertLinkedItemDocument>
) => {
  logger.info('Inserting linked item');
  const result = await hasuraClient.mutate({
    mutation: InsertLinkedItemDocument,
    variables,
  });

  return result.data?.insert_linked_item_one;
};

export const insertLinkedItems = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertLinkedItemsDocument>
) => {
  logger.info('Inserting linked items');
  const result = await hasuraClient.mutate({
    mutation: InsertLinkedItemsDocument,
    variables,
  });

  return result.data?.insert_linked_item;
};

export const deleteLinkedItems = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteLinkedItemsDocument>
) => {
  logger.info('Deleting linked items');
  const result = await hasuraClient.mutate({
    mutation: DeleteLinkedItemsDocument,
    variables,
  });

  return result.data?.delete_linked_item?.affected_rows;
};
