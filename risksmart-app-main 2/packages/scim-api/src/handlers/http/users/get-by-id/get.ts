import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getAuthContext } from 'src/handlers/auth/authContext';
import { parseQueryString } from 'src/parsers/parsers';
import { createScimUserMapper } from 'src/scim/mappings';
import { BadRequestResponse, NotFoundResponse } from 'src/scim/responseTypes';
import type { HasuraUser } from 'src/scim/types';
import { getUserById } from 'src/services/hasura/getUserById';
import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async (event) => {
  console.log('event', event);

  const { orgKey, tenant, domains } = getAuthContext(event);

  // Validate userId is provided
  if (!event.pathParameters || !event.pathParameters.userId) {
    return BadRequestResponse('userId path parameter is not provided.');
  }
  const userId = event.pathParameters.userId;

  // Get attributes from query string
  const { attributes } = parseQueryString(event.queryStringParameters);
  const mapHasuraUserToScim = createScimUserMapper(attributes);

  // Get user from Hasura
  const hasuraClient = getHasuraAdminClient(tenant);
  const userResponse = await getUserById(hasuraClient, { Id: userId });
  if (!userResponse || !userResponse.length) {
    return NotFoundResponse('User not found.');
  }
  const hasuraUser: HasuraUser = userResponse[0];

  // Validate users orgKey
  if (!hasuraUser.organisationusers?.some((ou) => ou.OrgKey === orgKey)) {
    return BadRequestResponse(
      'Attempting to retrieve user for unauthorized org.'
    );
  }

  // Validate users email domain
  const emailDomain = hasuraUser.Email?.split('@')[1].toLowerCase();
  if (!emailDomain || !domains.includes(emailDomain)) {
    return BadRequestResponse(
      'Attempting to retrieve user for unauthorized domain.'
    );
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/scim+json',
    },
    body: JSON.stringify(mapHasuraUserToScim(hasuraUser)),
  };
});
