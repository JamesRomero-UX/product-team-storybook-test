import type { ApolloClient } from '@apollo/client';

import {
  GetAuthConnectionsForUsersDocument,
  type GetAuthConnectionsForUsersQuery,
  type GetAuthConnectionsForUsersQueryVariables,
} from '../../../generated/graphql';
import { getLogger } from '../../logger';

const logger = getLogger();

/**
 * Returns a Map of userId -> AuthConnection for users belonging to the specified org.
 */
export const getAuthConnectionsForUsers = async (
  client: ApolloClient<unknown>,
  userIds: string[],
  orgKey: string
): Promise<Map<string, string>> => {
  if (!userIds.length) {
    return new Map();
  }

  logger.info('Fetching auth connections for users', {
    count: userIds.length,
    orgKey,
  });

  const uniqueIds = Array.from(new Set(userIds));
  const variables: GetAuthConnectionsForUsersQueryVariables = {
    userIds: uniqueIds,
    orgKey,
  };
  const result = await client.query<
    GetAuthConnectionsForUsersQuery,
    GetAuthConnectionsForUsersQueryVariables
  >({
    query: GetAuthConnectionsForUsersDocument,
    variables,
  });

  if (result.errors) {
    logger.error('Error fetching auth connections for users', {
      errors: result.errors,
      orgKey,
      userIds: uniqueIds,
    });
    throw new Error('Error fetching auth connections for users');
  }

  const map = new Map<string, string>();
  result.data.auth_user.forEach((u) => {
    const membership = u.organisationusers.find((ou) => !!ou.AuthConnection);
    const conn = membership?.AuthConnection ?? undefined;
    if (conn) {
      map.set(u.Id, conn);
    }
  });

  return map;
};
