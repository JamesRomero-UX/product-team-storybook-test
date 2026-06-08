import {
  AccessTypeEnum,
  GetThirdPartyContactPasswordSetByUserIdDocument,
  type GetThirdPartyContactPasswordSetByUserIdQuery,
  InsertThirdPartyContactDocument,
  type InsertThirdPartyContactMutation,
  ParentTypeEnum,
} from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { auth0Service } from 'src/services/auth0';
import type { AddToOrgRequest } from 'src/services/auth0/addThirdPartyUserToOrg';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { getOrgDetails } from 'src/services/orgUtilities';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { handler as sendSetPasswordNotification } from '../notifications/thirdPartySetPasswordNotifier';
import { CreateContactSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(
  CreateContactSchema,
  async (body) => {
    const hasuraClient = getHasuraBackendClientForAction(body);
    const sessionData = getSessionData(body.session_variables);
    const input = body.input;

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      objectType: ParentTypeEnum.ThirdParty,
      accessType: AccessTypeEnum.Update,
    });

    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    const connectionName = getEnv('AUTH0_THIRD_PARTY_CONNECTION_NAME');
    const clientId = getEnv('AUTH0_THIRD_PARTY_CLIENT_ID');

    if (!connectionName) {
      throw new Error(
        'Cannot create third party contact without a connection name, check env AUTH0_THIRD_PARTY_CONNECTION_NAME'
      );
    }

    logger.info('Creating third party contact', {
      thirdPartyId: input.ThirdPartyId,
      email: input.Email,
    });

    // Create Auth0 user first to get the userId
    const auth0Client = getAuth0ManagementClient();

    const addToOrgRequest: AddToOrgRequest = {
      orgId: sessionData.orgKey,
      tenant: sessionData.tenant,
      questionnaireInviteId: '', // Will be set to contact ID after creation
      connection: connectionName,
      clientId,
      send_email: false, // We'll handle the email ourselves
      inviter: {
        name: 'RiskSmart',
      },
      invitee: {
        email: input.Email,
      },
    };

    try {
      // Create Auth0 user first to get userId
      const { userId, changePasswordUrl, loginUrl, newUser, lastLogin } =
        await auth0Service.addThirdPartyUserToOrg(auth0Client, addToOrgRequest);

      // If the user already exists, check if they have a PasswordSetAtTimestamp
      // from another org so the new contact record is immediately "active"
      let passwordSetAtTimestamp: string | null = null;
      if (!newUser) {
        const adminClient = getHasuraAdminClient(sessionData.tenant);
        const existingContact =
          await adminClient.query<GetThirdPartyContactPasswordSetByUserIdQuery>(
            {
              query: GetThirdPartyContactPasswordSetByUserIdDocument,
              variables: { UserId: userId },
            }
          );
        passwordSetAtTimestamp =
          existingContact.data?.third_party_contact?.[0]
            ?.PasswordSetAtTimestamp ?? null;
      }

      // Fall back to Auth0's last_login for cross-tenant scenarios where
      // the user exists but no contact record is found in this tenant
      if (!newUser && !passwordSetAtTimestamp && lastLogin) {
        passwordSetAtTimestamp =
          typeof lastLogin === 'string' ? lastLogin : String(lastLogin);
      }

      // Now insert the contact record with the userId
      const insertResult =
        await hasuraClient.mutate<InsertThirdPartyContactMutation>({
          mutation: InsertThirdPartyContactDocument,
          variables: {
            ThirdPartyId: input.ThirdPartyId,
            Email: input.Email,
            Name: input.Name ?? null,
            JobTitle: input.JobTitle ?? null,
            UserId: userId,
            PasswordSetAtTimestamp: passwordSetAtTimestamp,
          },
        });

      const contact = insertResult.data?.insert_third_party_contact_one;

      if (!contact) {
        throw new Error('Failed to create third party contact');
      }

      logger.info('Auth0 user created/found for contact', {
        contactId: contact.Id,
        userId,
        newUser,
        hasPasswordResetUrl: !!changePasswordUrl,
      });

      if (newUser && changePasswordUrl) {
        logger.info('New user - sending password reset notification');

        const orgDetails = await getOrgDetails({
          orgKey: sessionData.orgKey,
          tenant: sessionData.tenant,
        });

        await sendSetPasswordNotification({
          OrgKey: sessionData.orgKey,
          Tenant: sessionData.tenant,
          UserId: userId,
          ChangePasswordUrl: changePasswordUrl,
          LoginUrl: loginUrl,
          OrgName: orgDetails?.OrgName ?? '-',
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          Id: contact.Id,
        }),
      };
    } catch (error) {
      logger.error('Error creating Auth0 user and contact', { error });

      // If Auth0 or contact creation fails, return error
      throw new Error(
        'Failed to create third party contact. Unable to create user account.'
      );
    }
  }
);
