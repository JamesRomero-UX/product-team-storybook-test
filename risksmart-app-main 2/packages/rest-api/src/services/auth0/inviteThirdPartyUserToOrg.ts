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

export type InviteToOrgRequest = ThirdPartyOrgRequest;

export const inviteThirdPartyUserToOrg = async (
  auth0Client: ManagementClient,
  request: InviteToOrgRequest
) => {
  logger.info('Invite to org request', { request });

  const { user, newUser, hasExistingAppUser } = await resolveThirdPartyUser(
    auth0Client,
    request
  );

  // Treat existing users who have never logged in (e.g. expired password
  // ticket) the same as brand-new users: they still need a password reset
  // link and should NOT receive Auth0's generic "invite to org" email.
  const needsPasswordReset = newUser || user.logins_count === 0;

  await setUserTenant(auth0Client, user.user_id, request.tenant);

  const userId = await upsertHasuraUser(request, user);

  const alreadyMember = await isOrgMember(
    auth0Client,
    user.user_id,
    request.orgId
  );

  let invitationUrl;

  if (!alreadyMember) {
    const response = await auth0Client.organizations.createInvitation(
      { id: request.orgId },
      {
        inviter: { name: request.inviter.name },
        invitee: { email: user.email },
        client_id: request.clientId,
        send_invitation_email: !needsPasswordReset || hasExistingAppUser,
      }
    );
    if (!statusIsSuccess(response.status)) {
      logger.error('Error inviting user to org', { response });
      throw new Error('Error inviting user to org from Auth0');
    }
    invitationUrl = response.data.invitation_url;
  } else {
    const clientResponse = await auth0Client.clients.get({
      client_id: request.clientId,
    });
    invitationUrl = clientResponse.data.initiate_login_uri;
  }

  const changePasswordUrl = needsPasswordReset
    ? await generatePasswordResetUrl(auth0Client, user.user_id, invitationUrl)
    : undefined;

  return {
    userId,
    changePasswordUrl,
    invitationUrl,
    newUser: needsPasswordReset,
    newMember: !alreadyMember,
  };
};
