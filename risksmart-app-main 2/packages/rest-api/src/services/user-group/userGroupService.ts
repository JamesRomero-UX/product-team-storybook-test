import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { DeleteUserGroupsDocument } from '../../../generated/graphql';
import { getLogger } from '../../logger';
import { getRisksmartApiClient } from '../../repositories/getRisksmartApiClient';
const logger = getLogger();

export const deleteUserGroup = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  variables: VariablesOf<typeof DeleteUserGroupsDocument>
) => {
  logger.info('deleting user group');
  const result =
    await getRisksmartApiClient(hasuraClient).deleteUserGroups(variables);

  return result?.delete_user_group?.affected_rows;
};
