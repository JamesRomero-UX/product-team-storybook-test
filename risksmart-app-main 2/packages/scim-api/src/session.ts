// Type isn't strictly correct, as each value can be string or undefined.
// Should change this once we are correctly asserting the values in code.
export type SessionVariables = { [k: string]: string } | null;

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
  const orgKey = sessionVariables['x-hasura-org-id'];
  const userId = sessionVariables['x-hasura-user-id'];
  const userRole = sessionVariables['x-hasura-role'];
  const tenant = sessionVariables['x-hasura-tenant-name'];

  return {
    orgKey,
    userId,
    userRole,
    tenant,
  };
};
