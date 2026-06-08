import type { ManagementClient } from 'auth0';

import { getLogger } from '../../logger';
import {
  generatePasswordResetUrl,
  isOrgMember,
  resolveThirdPartyUser,
  setUserTenant,
  statusIsSuccess,
  type ThirdPartyOrgRequest,
  upsertHasuraUser,
} from './thirdPartyUserUtils';

const logger = getLogger();

export type AddToOrgRequest = ThirdPartyOrgRequest;

export const addThirdPartyUserToOrg = async (
  auth0Client: ManagementClient,
  request: AddToOrgRequest
) => {
  logger.info('Add to org request', { request });

  const { user, newUser } = await resolveThirdPartyUser(auth0Client, request);

  await setUserTenant(auth0Client, user.user_id, request.tenant);

  const userId = await upsertHasuraUser(request, user);

  const alreadyMember = await isOrgMember(
    auth0Client,
    user.user_id,
    request.orgId
  );

  if (!alreadyMember) {
    const response = await auth0Client.organizations.addMembers(
      { id: request.orgId },
      { members: [user.user_id] }
    );
    if (!statusIsSuccess(response.status)) {
      logger.error('Error adding user to org', { response });
      throw new Error('Error adding user to org from Auth0');
    }
  }

  const clientResponse = await auth0Client.clients.get({
    client_id: request.clientId,
  });
  const loginUrl = clientResponse.data.initiate_login_uri;

  const changePasswordUrl = newUser
    ? await generatePasswordResetUrl(auth0Client, user.user_id, loginUrl)
    : undefined;

  return {
    userId,
    changePasswordUrl,
    loginUrl,
    newUser,
    newMember: !alreadyMember,
    lastLogin: user.last_login,
  };
};
