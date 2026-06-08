import {
  AccessTypeEnum,
  GetThirdPartyContactByIdDocument,
  type GetThirdPartyContactByIdQuery,
  ParentTypeEnum,
  UpdateThirdPartyContactRevokedDocument,
  type UpdateThirdPartyContactRevokedMutation,
} from 'generated/graphql';
import { Forbidden, InternalServerError, NotFound } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { escapeLucene } from 'src/services/auth0/thirdPartyUserUtils';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { patchSchema } from './schema';

const logger = getLogger();

interface ContactToRevoke {
  contactId: string;
  email: string;
  auth0UserId: string | null;
}

export const handler = backendRouteHandler(patchSchema, async (body) => {
  const hasuraClient = getHasuraBackendClientForAction(body);
  const sessionData = getSessionData(body.session_variables);
  const { ContactIds } = body.input;

  // Check permission to update third party
  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.ThirdParty,
    accessType: AccessTypeEnum.Update,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const connectionName = getEnv('AUTH0_THIRD_PARTY_CONNECTION_NAME');
  const auth0Client = getAuth0ManagementClient();

  const results: Array<{
    Id: string;
    IsRevoked: boolean;
    Message: string;
  }> = [];

  const contactsToRevoke: ContactToRevoke[] = [];

  // Phase 1: Fetch all contacts and find their Auth0 user IDs
  for (const contactId of ContactIds) {
    const contactResult =
      await hasuraClient.query<GetThirdPartyContactByIdQuery>({
        query: GetThirdPartyContactByIdDocument,
        variables: { Id: contactId },
      });

    const contact = contactResult.data?.third_party_contact_by_pk;

    if (!contact) {
      throw new NotFound(`Contact not found: ${contactId}`);
    }

    if (contact.IsRevoked) {
      results.push({
        Id: contactId,
        IsRevoked: true,
        Message: 'Contact access was already revoked',
      });
      continue;
    }

    logger.info('Preparing to revoke third party contact access', {
      contactId,
      email: contact.Email,
    });

    // Find the Auth0 user by email
    let auth0UserId: string | null = null;
    try {
      const existingUser = await auth0Client.users.getAll({
        q: `email:"${escapeLucene(contact.Email)}" AND identities.connection:"${escapeLucene(connectionName)}"`,
        search_engine: 'v3',
      });

      if (
        existingUser.data &&
        existingUser.data.length === 1 &&
        existingUser.data[0]?.user_id
      ) {
        auth0UserId = existingUser.data[0].user_id;
      }
    } catch (error) {
      logger.error('Error finding Auth0 user', { error, contactId });
      throw new InternalServerError(
        `Failed to find Auth0 user for contact: ${contactId}`
      );
    }

    contactsToRevoke.push({
      contactId,
      email: contact.Email,
      auth0UserId,
    });
  }

  // Phase 2: Also find existing app users (different connection) for contacts
  // that weren't found via the third-party connection search
  const appUserContactIds = new Set<string>();
  const contactsWithoutAuth0User = contactsToRevoke.filter(
    (c) => c.auth0UserId === null
  );
  for (const contact of contactsWithoutAuth0User) {
    try {
      const appUser = await auth0Client.users.getAll({
        q: `email:"${escapeLucene(contact.email)}" AND NOT identities.connection:"${escapeLucene(connectionName)}"`,
        search_engine: 'v3',
      });
      if (
        appUser.data &&
        appUser.data.length === 1 &&
        appUser.data[0]?.user_id
      ) {
        contact.auth0UserId = appUser.data[0].user_id;
        appUserContactIds.add(contact.contactId);
      }
    } catch (error) {
      logger.error('Error finding app user in Auth0', {
        error,
        contactId: contact.contactId,
      });
    }
  }

  // Phase 3: Remove all Auth0 users from the org in a single call
  const auth0UserIds = contactsToRevoke
    .map((c) => c.auth0UserId)
    .filter((id): id is string => id !== null);

  if (auth0UserIds.length > 0) {
    try {
      await auth0Service.removeUsersFromOrg({
        auth0Client,
        userIds: auth0UserIds,
        orgId: sessionData.orgKey,
      });

      logger.info('Removed users from Auth0 organization', {
        userIds: auth0UserIds,
        contactIds: contactsToRevoke
          .filter((c) => c.auth0UserId !== null)
          .map((c) => c.contactId),
      });
    } catch (error) {
      logger.error('Error removing users from Auth0 organization', { error });
      throw new InternalServerError('Failed to revoke contact access in Auth0');
    }
  }

  // Phase 4: Clean up third_party_orgs metadata for contacts found via the
  // app-user fallback (Phase 2). Only these contacts have third_party_orgs set.
  for (const contact of contactsToRevoke) {
    if (contact.auth0UserId && appUserContactIds.has(contact.contactId)) {
      try {
        const userResponse = await auth0Client.users.get({
          id: contact.auth0UserId,
        });
        const existingMetadata =
          (userResponse.data.app_metadata as Record<string, unknown>) ?? {};
        const thirdPartyOrgs = existingMetadata.third_party_orgs as
          | Record<string, boolean>
          | undefined;
        if (thirdPartyOrgs?.[sessionData.orgKey]) {
          const { [sessionData.orgKey]: _, ...remainingOrgs } = thirdPartyOrgs;
          await auth0Client.users.update(
            { id: contact.auth0UserId },
            {
              app_metadata: {
                ...existingMetadata,
                third_party_orgs:
                  Object.keys(remainingOrgs).length > 0 ? remainingOrgs : null,
              },
            }
          );
        }
      } catch (error) {
        logger.error('Error cleaning up third_party_orgs metadata', {
          error,
          contactId: contact.contactId,
        });
      }
    }
  }

  // Phase 5: Update all contacts in the database
  for (const { contactId } of contactsToRevoke) {
    const updateResult =
      await hasuraClient.mutate<UpdateThirdPartyContactRevokedMutation>({
        mutation: UpdateThirdPartyContactRevokedDocument,
        variables: { Id: contactId, IsRevoked: true },
      });

    if (!updateResult.data?.update_third_party_contact_by_pk) {
      throw new Error(`Failed to update contact: ${contactId}`);
    }

    results.push({
      Id: contactId,
      IsRevoked: true,
      Message: 'Contact access has been revoked',
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ results }),
  };
});
