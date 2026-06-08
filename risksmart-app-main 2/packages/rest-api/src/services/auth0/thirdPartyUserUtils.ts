import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import type { ManagementClient } from 'auth0';
import type { GetUsers200ResponseOneOfInner } from 'auth0/dist/cjs/management/__generated/models';
import { randomBytes } from 'crypto';
import { GetUsersDocument } from 'generated/graphql';

import { getHasuraAdminClient } from '../../adminGraphqlClient';
import { getLogger } from '../../logger';
import { SYSTEM_USER } from '../../repositories/types';
import { insertAuthUser } from '../user/userService';

const logger = getLogger();

export const statusIsSuccess = (code: number) =>
  [200, 201, 202, 204].includes(code);

/**
 * Escapes Lucene special characters in a string so it can be safely
 * interpolated into an Auth0 Management API search query.
 *
 * Special characters: + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /
 */
export const escapeLucene = (value: string): string =>
  value.replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');

export interface ThirdPartyOrgRequest {
  orgId: string;
  tenant: string;
  questionnaireInviteId: string;
  connection: string;
  clientId: string;
  send_email: boolean;
  inviter: {
    name: string;
  };
  invitee: {
    email: string;
  };
}

export interface ResolvedThirdPartyUser {
  user: GetUsers200ResponseOneOfInner;
  newUser: boolean;
  hasExistingAppUser: boolean;
}

/**
 * Finds an existing third-party connection user or creates a new one.
 * Always creates a new third-party user even if an app user exists with the
 * same email, since app connections can't authenticate on the third-party portal.
 *
 * Also marks any existing app user with `third_party_orgs` in app_metadata
 * as defense-in-depth so the post-login action assigns ThirdPartyRespondent
 * if they ever access this org via the main app.
 */
export const resolveThirdPartyUser = async (
  auth0Client: ManagementClient,
  request: ThirdPartyOrgRequest
): Promise<ResolvedThirdPartyUser> => {
  const { invitee, connection, orgId } = request;

  const existingThirdPartyUser = await auth0Client.users.getAll({
    q: `email:"${escapeLucene(invitee.email)}" AND identities.connection:"${escapeLucene(connection)}"`,
    search_engine: 'v3',
  });

  if (
    statusIsSuccess(existingThirdPartyUser.status) &&
    hasLengthAtLeast(existingThirdPartyUser.data, 1)
  ) {
    logger.info('Third-party user exists', {
      user: existingThirdPartyUser.data[0],
    });

    return {
      user: existingThirdPartyUser.data[0],
      newUser: false,
      hasExistingAppUser: false,
    };
  }

  // Check for an existing app user with a different connection
  const existingAppUser = await auth0Client.users.getAll({
    q: `email:"${escapeLucene(invitee.email)}" AND NOT identities.connection:"${escapeLucene(connection)}"`,
    search_engine: 'v3',
  });
  const hasExistingAppUser =
    statusIsSuccess(existingAppUser.status) &&
    hasLengthAtLeast(existingAppUser.data, 1);

  // Mark the app user with third_party_orgs as defense-in-depth
  if (hasExistingAppUser && hasLengthAtLeast(existingAppUser.data, 1)) {
    const appUser = existingAppUser.data[0];
    logger.info('App user exists, marking with third_party_orgs', {
      appUserId: appUser.user_id,
    });
    const appUserMetadata = (
      await auth0Client.users.get({ id: appUser.user_id })
    ).data.app_metadata;
    await auth0Client.users.update(
      { id: appUser.user_id },
      {
        app_metadata: {
          ...appUserMetadata,
          third_party_orgs: {
            ...(appUserMetadata?.third_party_orgs || {}),
            [orgId]: true,
          },
        },
      }
    );
  }

  // Create a new third-party connection user
  logger.info('Creating third-party user in Auth0');
  const response = await auth0Client.users.create({
    username: randomBytes(15).toString('hex').slice(0, 14),
    email: invitee.email,
    password: `A1!${randomBytes(15).toString('base64').slice(0, 20)}`,
    connection,
    verify_email: false,
    // Automatically verify email to reduce friction - we control the invite flow
    // See RSP-3747 and RSP-3748
    email_verified: true,
  });
  logger.info('Created third-party user in Auth0', { response });

  if (!statusIsSuccess(response.status) || !response.data.email) {
    logger.error('Error creating user in Auth0', { response });
    throw new Error('Error creating user in Auth0');
  }

  return { user: response.data, newUser: true, hasExistingAppUser };
};

/**
 * Inserts a user into Hasura. If a uniqueness violation occurs (e.g. legacy
 * users created outside SSO/SCIM), looks up the existing user ID instead.
 * Returns the resolved Hasura user ID.
 */
export const upsertHasuraUser = async (
  request: ThirdPartyOrgRequest,
  user: GetUsers200ResponseOneOfInner
): Promise<string> => {
  const hasuraClient = getHasuraAdminClient(request.tenant);

  try {
    await insertAuthUser(hasuraClient, {
      UserId: user.user_id,
      Email: user.email,
      UserName: user.email.split('@')[0],
      CreatedByUser: SYSTEM_USER,
      OrgKey: request.orgId,
      AuthConnection: request.connection,
    });

    return user.user_id;
  } catch (e) {
    if (e instanceof Error && !e.message.startsWith('Uniqueness violation')) {
      throw e;
    }
    const { data } = await hasuraClient.query({
      query: GetUsersDocument,
      variables: {
        where: { Email: { _eq: user.email } },
      },
    });

    return data?.user?.[0]?.Id ?? user.user_id;
  }
};

/**
 * Checks whether a user is already a member of an Auth0 organization.
 */
export const isOrgMember = async (
  auth0Client: ManagementClient,
  userId: string,
  orgId: string
): Promise<boolean> => {
  const userOrgs = await auth0Client.users.getUserOrganizations({
    id: userId,
  });

  return userOrgs.data.some((org) => org.id === orgId);
};

/**
 * Generates a password reset URL for a new user.
 */
export const generatePasswordResetUrl = async (
  auth0Client: ManagementClient,
  userId: string,
  resultUrl: string
): Promise<string | undefined> => {
  const ticketResponse = await auth0Client.tickets.changePassword({
    user_id: userId,
    result_url: resultUrl,
    mark_email_as_verified: true,
  });

  if (statusIsSuccess(ticketResponse.status)) {
    return ticketResponse.data.ticket;
  }

  return undefined;
};

/**
 * Updates app_metadata on a user so the post-change-password action can
 * update PasswordSetAtTimestamp across all relevant Hasura tenants.
 *
 * Maintains `third_party_tenants` as a deduplicated array of every tenant
 * the user has been invited to.
 */
export const setUserTenant = async (
  auth0Client: ManagementClient,
  userId: string,
  tenant: string
): Promise<void> => {
  const existingMetadata = (await auth0Client.users.get({ id: userId })).data
    .app_metadata;

  const existingTenants: string[] = existingMetadata?.third_party_tenants ?? [];
  const thirdPartyTenants = [...new Set([...existingTenants, tenant])];

  await auth0Client.users.update(
    { id: userId },
    {
      app_metadata: {
        ...existingMetadata,
        third_party_tenants: thirdPartyTenants,
      },
    }
  );
};
