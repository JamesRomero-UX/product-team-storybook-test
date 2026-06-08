import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetAuthUserByIdDocument } from 'generated/graphql';

export const getUserById = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetAuthUserByIdDocument>
) => {
  console.log('Getting user by id', variables);
  const result = await hasuraClient.mutate({
    mutation: GetAuthUserByIdDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error getting user by id', result.errors);
    throw new Error('Error getting user by id');
  }

  return result.data?.auth_user;
};
