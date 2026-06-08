import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetOrganisationDocument } from 'generated/graphql';

export const getOrganisation = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetOrganisationDocument>
) => {
  console.log('Getting organisation by org key', variables);
  const result = await hasuraClient.mutate({
    mutation: GetOrganisationDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error getting organisation by org key', result.errors);
    throw new Error('Error getting organisation by org key');
  }

  return result.data?.auth_organisation_by_pk;
};
