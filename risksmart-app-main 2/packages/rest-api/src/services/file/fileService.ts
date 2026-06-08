import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { DeleteFileDocument } from 'generated/graphql';

export const deleteFile = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteFileDocument>
) => {
  const result = await hasuraClient.mutate({
    mutation: DeleteFileDocument,
    variables,
  });

  return result.data?.delete_file;
};
