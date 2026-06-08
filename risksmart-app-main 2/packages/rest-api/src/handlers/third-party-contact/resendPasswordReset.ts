import {
  AccessTypeEnum,
  GetThirdPartyContactByIdDocument,
  type GetThirdPartyContactByIdQuery,
  ParentTypeEnum,
} from 'generated/graphql';
import { BadRequest, Forbidden, NotFound, Unauthorized } from 'http-errors';
import { getEnv } from 'src/environment';
import frontendApiHandler from 'src/frontendApiHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { getLogger } from 'src/logger';
import {
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { escapeLucene } from 'src/services/auth0/thirdPartyUserUtils';
import { hasPermission } from 'src/services/role-access/roleAccessService';

import { ResendPasswordResetSchema } from './schema';

const logger = getLogger();

export const handler = frontendApiHandler(
  ResendPasswordResetSchema,
  async ({ ContactId }, evt) => {
    if (!evt.headers.authorization) {
      throw new Unauthorized('Invalid authorization credentials in request');
    }

    const hasuraClient = await getHasuraClient({
      authorization: evt.headers.authorization,
      tenantName: getTenantNameFromClaims(evt),
    });
    const userId = getUserIdFromClaims(evt);

    // Check permission to update third party
    const permissionGranted = await hasPermission(hasuraClient, {
      userId,
      objectType: ParentTypeEnum.ThirdParty,
      accessType: AccessTypeEnum.Update,
    });

    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    // Get the contact to find the email
    const contactResult =
      await hasuraClient.query<GetThirdPartyContactByIdQuery>({
        query: GetThirdPartyContactByIdDocument,
        variables: { Id: ContactId },
      });

    const contact = contactResult.data?.third_party_contact_by_pk;

    if (!contact) {
      throw new NotFound('Contact not found');
    }

    if (contact.IsRevoked) {
      throw new BadRequest('Cannot resend password reset for revoked contact');
    }

    logger.info('Resending password reset for third party contact', {
      contactId: ContactId,
      email: contact.Email,
    });

    const connectionName = getEnv('AUTH0_THIRD_PARTY_CONNECTION_NAME');
    const clientId = getEnv('AUTH0_THIRD_PARTY_CLIENT_ID');
    const auth0Client = getAuth0ManagementClient();

    // Find the Auth0 user by email
    const existingUser = await auth0Client.users.getAll({
      q: `email:"${escapeLucene(contact.Email)}" AND identities.connection:"${escapeLucene(connectionName)}"`,
      search_engine: 'v3',
    });

    if (
      !existingUser.data ||
      existingUser.data.length === 0 ||
      !existingUser.data[0]?.user_id
    ) {
      throw new NotFound(
        'Auth0 user not found for this contact. The contact may need to be recreated.'
      );
    }

    const auth0UserId = existingUser.data[0].user_id;

    // Get the login URL for the result
    const clientResponse = await auth0Client.clients.get({
      client_id: clientId,
    });
    const loginUrl = clientResponse.data.initiate_login_uri ?? '';

    // Trigger password reset
    const passwordResetUrl = await auth0Service.triggerPasswordReset({
      auth0Client,
      userId: auth0UserId,
      resultUrl: loginUrl,
    });

    if (!passwordResetUrl || passwordResetUrl.length === 0) {
      throw new Error('Failed to generate password reset URL');
    }

    logger.info('Password reset URL generated for contact', {
      contactId: ContactId,
      userId: auth0UserId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: ContactId,
        PasswordResetUrl: passwordResetUrl,
        Message: 'Password reset email has been sent',
      }),
    };
  }
);
