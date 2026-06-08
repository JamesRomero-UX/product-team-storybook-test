import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { InsertOrganisationUserDocument } from 'generated/graphql';

export const assignUserToOrg = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertOrganisationUserDocument>
) => {
  console.log('Assinging user to org', variables);
  const result = await hasuraClient.mutate({
    mutation: InsertOrganisationUserDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error assigning user to org', result.errors);
    throw new Error('Error assigning user to org');
  }

  return result.data?.insert_auth_organisationuser_one;
};
