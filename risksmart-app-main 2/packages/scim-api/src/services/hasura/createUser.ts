import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { InsertUserDocument } from 'generated/graphql';

export const createUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertUserDocument>
) => {
  console.log('Creating user');
  const result = await hasuraClient.mutate({
    mutation: InsertUserDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error creating user', result.errors);
    throw new Error('Error creating user');
  }

  return result.data?.insert_auth_user_one;
};
