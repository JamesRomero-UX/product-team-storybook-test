import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { BadRequest, isHttpError } from 'http-errors';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getAuthContext } from 'src/handlers/auth/authContext';
import { createScimUserMapper } from 'src/scim/mappings';
import { mapScimUserToHasuraUpdate } from 'src/scim/mappings';
import {
  InternalServerErrorResponse,
  NotFoundResponse,
  scimErrorResponse,
} from 'src/scim/responseTypes';
import { scimEnterpriseUserSchema } from 'src/scim/schemas';
import { getUserById } from 'src/services/hasura/getUserById';
import { updateUser } from 'src/services/hasura/updateUser';
import { ApiHandler } from 'sst/node/api';
import type { z } from 'zod';

const putSchema = scimEnterpriseUserSchema;

export type PutSchema = z.infer<typeof putSchema>;

export const handler = ApiHandler(async (event) => {
  console.debug('event', event);
  try {
    const { orgKey, tenant, domains } = getAuthContext(event);
    const { userId, body } = validateRequest(event);
    const updates = mapScimUserToHasuraUpdate({ ...body, id: userId });

    // Get existing user
    const hasuraClient = getHasuraAdminClient(tenant);
    const hasuraUser = await getUserById(hasuraClient, { Id: userId });
    if (!hasuraUser || !hasuraUser.length) {
      return NotFoundResponse('User not found.');
    }

    // Validate email domains
    const userEmailDomain = hasuraUser[0].Email?.split('@')[1].toLowerCase();
    const updateEmailDomain = updates.Email
      ? (updates.Email as string).split('@')[1].toLowerCase()
      : undefined;
    console.log('userEmailDomain', userEmailDomain);
    console.log('updateEmailDomain', updateEmailDomain);
    if (
      !userEmailDomain ||
      !domains.includes(userEmailDomain) ||
      (updateEmailDomain && !domains.includes(updateEmailDomain))
    ) {
      return scimErrorResponse(
        403,
        'Attempting to update user for unauthorized domain.'
      );
    }

    // Update user
    const updatedUser = await updateUser(hasuraClient, userId, orgKey, updates);
    console.debug('updatedUser', updatedUser);

    const mapHasuraUserToScim = createScimUserMapper();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/scim+json',
      },
      body: JSON.stringify(mapHasuraUserToScim(updatedUser)),
    };
  } catch (error) {
    console.error('Error updating user: ', error);
    if (isHttpError(error)) {
      return scimErrorResponse(error.statusCode, error.message);
    }

    return InternalServerErrorResponse();
  }
});

const validateRequest = (event: APIGatewayProxyEventV2) => {
  console.log('Validating request...');
  if (!event.pathParameters || !event.pathParameters.userId) {
    throw new BadRequest('userId path parameter is not provided.');
  }
  const userId = event.pathParameters.userId;

  const unparsedBody = JSON.parse(event.body || '{}') as PutSchema;
  const parsedBody = putSchema.safeParse(unparsedBody);

  if (!parsedBody.success) {
    console.error('Invalid request body.', parsedBody.error);
    throw new BadRequest('Invalid request body.');
  }
  const body = parsedBody.data;

  console.log('successfully validated request', { userId });
  console.debug('body', body);

  return { userId, body };
};
