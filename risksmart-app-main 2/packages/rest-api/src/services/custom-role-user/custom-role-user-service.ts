import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { UpdateCustomRoleUsersDocument } from 'generated/graphql';

import { getLogger } from '../../logger';

const logger = getLogger();

/**
 * Updates custom role user assignments by adding and removing roles.
 * This is a low-level service function focused on data persistence.
 */
export const updateCustomRoleUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateCustomRoleUsersDocument>
) => {
  logger.info('Updating custom role user assignments', {
    userId: variables.userId,
    rolesToAddCount: Array.isArray(variables.rolesToAdd)
      ? variables.rolesToAdd.length
      : 1,
    roleIdsToRemoveCount: Array.isArray(variables.roleIdsToRemove)
      ? variables.roleIdsToRemove.length
      : 1,
  });

  const result = await hasuraClient.mutate({
    mutation: UpdateCustomRoleUsersDocument,
    variables,
  });

  const insertedRows = result.data?.insert_custom_role_user?.affected_rows;
  const deletedRows = result.data?.delete_custom_role_user?.affected_rows;

  logger.info('Custom role user assignments updated', {
    insertedRows,
    deletedRows,
  });

  return {
    insertedRows,
    deletedRows,
  };
};
