import type { SessionVariables } from './handlers/events/DataChangeEvent';

export interface SessionData {
  orgKey: string;
  userId: string;
  userRole: string;
  tenant: string;
}

export const getSessionData = (
  sessionVariables: SessionVariables
): SessionData => {
  if (!sessionVariables) {
    sessionVariables = {};
  }
  // Currently the types aren't strictly correct here, as all of the below could be undefined.
  // TODO: should throw errors if the below are undefined if/when are confident they have always been specified throughout the codebase
  const orgKey = sessionVariables['x-hasura-org-id'] as string;
  const userId = sessionVariables['x-hasura-user-id'] as string;
  const userRole = sessionVariables['x-hasura-role'] as string;
  const tenant = sessionVariables['x-hasura-tenant-name'] as string;

  return {
    orgKey,
    userId,
    userRole,
    tenant,
  };
};
