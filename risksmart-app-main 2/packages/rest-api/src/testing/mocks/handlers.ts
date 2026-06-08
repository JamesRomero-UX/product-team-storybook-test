import { graphql, http, HttpResponse } from 'msw';

import { getLogger } from '../../logger';
import { auth0Roles } from '../test-data/roles';
const logger = getLogger();

const mockAuth0Domain = 'mocked-tenant.uk.auth0.com';

export const handlers = [
  http.post(`https://${mockAuth0Domain}/oauth/token`, () => {
    return HttpResponse.json({
      access_token: 'fake_access_token',
      token_type: 'Bearer',
      expires_in: 86400,
    });
  }),
  http.get(`https://${mockAuth0Domain}/api/v2/roles`, () => {
    return HttpResponse.json(auth0Roles);
  }),
  graphql.operation(({ query, variables }) => {
    // Catch all for unhandled requests
    logger.warn('Handler', { query, variables });

    return HttpResponse.json({
      errors: [{ message: 'Request failed' }],
    });
  }),
];
