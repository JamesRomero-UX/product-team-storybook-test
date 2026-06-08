import { Config } from 'sst/node/config';

import { getHasuraClient } from './graphqlClient';
import type { ActionInput } from './hasuraActionHelpers';
import { getSessionData } from './session';

/**
 * Graphql client that runs in the context of a backend Action User and role
 * will be taken from the action session variables
 *
 * @param actionEvent
 * @returns
 */
export const getHasuraBackendClientForAction = (
  actionEvent: ActionInput<unknown>
) => {
  return getHasuraClient({
    backendOnly: true,
    adminSecret: Config.HASURA_ADMIN_SECRET,
    tenantName: getSessionData(actionEvent.session_variables).tenant,
    hasuraSessionVariables: actionEvent.session_variables,
  });
};

/**
 * Graphql client that runs in the context of a backend user
 *
 * @param tenantName
 * @param orgKey
 * @param userId
 * @param userRole
 * @param hasuraSessionVariables
 */
export const getHasuraBackendClient = (
  tenantName: string,
  orgKey: string,
  userId: string,
  userRole: string,
  hasuraSessionVariables?: Record<string, string>
) => {
  return getHasuraClient({
    backendOnly: true,
    adminSecret: Config.HASURA_ADMIN_SECRET,
    tenantName: tenantName,
    hasuraSessionVariables: {
      ...hasuraSessionVariables,
      'x-hasura-org-id': orgKey,
      'x-hasura-user-id': userId,
      'x-hasura-role': userRole,
    },
  });
};
