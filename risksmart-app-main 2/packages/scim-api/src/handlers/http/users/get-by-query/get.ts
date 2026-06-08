import { GetAuthUsersByFilterDocument } from 'generated/graphql';
import { isHttpError } from 'http-errors';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getAuthContext } from 'src/handlers/auth/authContext';
import { parseQueryString } from 'src/parsers/parsers';
import {
  createScimUserMapper,
  mapAuthContextToHasura,
} from 'src/scim/mappings';
import {
  BadRequestResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
} from 'src/scim/responseTypes';
import type { ScimList } from 'src/scim/types';
import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async (event) => {
  console.debug('event', event);
  try {
    const { tenant, orgKey, domains } = getAuthContext(event);

    let parsedQueryString;
    try {
      parsedQueryString = parseQueryString(event.queryStringParameters);
    } catch (error) {
      console.error('Error parsing query string', error);

      return BadRequestResponse('Invalid query string parameters.');
    }
    const { filter, attributes, offset, limit } = parsedQueryString;

    console.log({
      filter,
      attributes,
      offset,
      limit,
    });

    const hasuraClient = getHasuraAdminClient(tenant);
    const hasuraUserResponse = await hasuraClient.query({
      query: GetAuthUsersByFilterDocument,
      variables: {
        limit,
        offset,
        // orderBy
        where: mapAuthContextToHasura(filter, orgKey, domains),
      },
    });
    console.log(
      'hasuraUserResponseAggregate',
      hasuraUserResponse.data.auth_user_aggregate
    );

    const mapHasuraUserToScim = createScimUserMapper(attributes);
    const response: ScimList = {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults:
        hasuraUserResponse.data.auth_user_aggregate.aggregate?.count ?? 0,
      Resources: hasuraUserResponse.data.auth_user.map(mapHasuraUserToScim),
      startIndex: offset + 1,
      itemsPerPage: limit,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/scim+json',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Get By Query Error', error);

    if (isHttpError(error) && error.statusCode === 401) {
      return UnauthorizedResponse();
    }

    return InternalServerErrorResponse();
  }
});
