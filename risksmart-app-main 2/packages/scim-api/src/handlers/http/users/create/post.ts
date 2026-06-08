import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { randomUUID } from 'crypto';
import {
  GetUserByEmailDocument,
  UpsertOrganisationDocument,
  UserStatusEnum,
} from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getAuthContext } from 'src/handlers/auth/authContext';
import {
  createScimUserMapper,
  mapScimUserToHasuraUpdate,
} from 'src/scim/mappings';
import {
  BadRequestResponse,
  ConflictResponse,
  InternalServerErrorResponse,
} from 'src/scim/responseTypes';
import { scimEnterpriseUserSchema } from 'src/scim/schemas';
import type { HasuraUser } from 'src/scim/types';
import { assignUserToOrg } from 'src/services/hasura/assignUserToOrg';
import { createUser } from 'src/services/hasura/createUser';
import { updateUser } from 'src/services/hasura/updateUser';
import { ApiHandler } from 'sst/node/api';
import type { z } from 'zod';

const postSchema = scimEnterpriseUserSchema.omit({ id: true });

export type PostSchema = z.infer<typeof postSchema>;

export const handler = ApiHandler(async (event) => {
  console.debug('event', event);
  const { orgKey, tenant, domains } = getAuthContext(event);

  const body = JSON.parse(event.body || '{}') as PostSchema;
  const parsedBody = postSchema.safeParse(body);
  if (!parsedBody.success) {
    console.error('Invalid request body', parsedBody.error);

    return BadRequestResponse('Invalid request body.');
  }

  const email =
    body.emails?.find((e) => e.primary)?.value || body.emails?.length === 1
      ? body.emails[0].value
      : undefined;
  console.log('email', email);

  if (!email) {
    console.error('Email is required');

    return BadRequestResponse('Email is required.');
  }

  // Validate email domain
  const emailDomain = email?.split('@')[1].toLowerCase();
  if (!emailDomain || !domains.includes(emailDomain)) {
    console.log('Email domain is not allowed', emailDomain);

    return BadRequestResponse('Email domain is not allowed.');
  }

  // Upsert organisation
  const hasuraClient = getHasuraAdminClient(tenant);
  const upsertOrgResponse = await hasuraClient.mutate({
    mutation: UpsertOrganisationDocument,
    variables: {
      id: orgKey,
    },
  });
  if (upsertOrgResponse.errors) {
    console.error('Error upserting organisation', upsertOrgResponse.errors);

    return InternalServerErrorResponse();
  }
  console.log('Upserted organisation', upsertOrgResponse);

  // Check if user exists
  const hasuraUserResponse = await hasuraClient.query({
    query: GetUserByEmailDocument,
    variables: {
      email,
    },
  });
  const userId = hasuraUserResponse.data.auth_user[0]?.Id;
  if (userId) {
    console.log('Existing user found for email', { userId });
  }

  // If user exists withing the same org, return conflict
  if (
    hasuraUserResponse.data.auth_user.some((u) =>
      u.organisationusers.some((ou) => ou.OrgKey === orgKey)
    )
  ) {
    return ConflictResponse('User with email already exists.');
  }

  // Check if user exists in another org
  const hasuraUser = hasuraUserResponse.data.auth_user.some(
    (u) => !u.organisationusers.some((ou) => ou.OrgKey === orgKey)
  )
    ? await updateHasuraUser(hasuraClient, userId, body, orgKey)
    : await createHasuraUser(hasuraClient, body, orgKey, tenant);

  // Map user response
  const mapHasuraUserToScim = createScimUserMapper();

  return {
    statusCode: 201,
    body: JSON.stringify(mapHasuraUserToScim(hasuraUser)),
  };
});

const createHasuraUser = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  body: PostSchema,
  orgKey: string,
  tenant: string
) => {
  console.log('Creating user');
  const variables = mapRequestBodyToCreateUserVariables(orgKey, tenant, body);
  const result = await createUser(hasuraClient, variables);

  return result as HasuraUser;
};

const updateHasuraUser = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  body: PostSchema,
  orgKey: string
) => {
  // Attach user to organisation
  console.log('Assigning user to org');
  await assignUserToOrg(hasuraClient, {
    OrgKey: orgKey,
    User_Id: userId,
    External_Id: body.externalId,
  });

  // Update user details
  console.log('Updating user details');
  const updates = mapScimUserToHasuraUpdate({ ...body, id: userId });
  const result = await updateUser(hasuraClient, userId, orgKey, updates);

  return result as HasuraUser;
};

const mapRequestBodyToCreateUserVariables = (
  orgKey: string,
  tenant: string,
  body: PostSchema
) => {
  const userId = randomUUID();

  return {
    userId: userId.toString(),
    orgKey,
    externalId: body.externalId,
    userName: body.userName,
    status: body.active ? UserStatusEnum.Active : UserStatusEnum.Archived,
    email: body.emails?.find((e) => e.primary)?.value,
    firstName: body.name?.givenName,
    lastName: body.name?.familyName,
    tenant,
    displayName: body.name?.formatted,
    jobTitle: body.title,
    department:
      body['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']
        ?.department,
    officeLocation:
      body.addresses?.find((a) => a.type === 'work')?.formatted ??
      body.addresses?.[0]?.formatted,
    createdByUser: 'SCIM',
  };
};
