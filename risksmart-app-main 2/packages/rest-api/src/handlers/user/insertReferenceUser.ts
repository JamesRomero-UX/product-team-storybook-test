import { randomUUID } from 'crypto';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { insertAuthUser } from 'src/services/user/userService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  if (!sessionData.orgKey) {
    throw new Error('OrgKey is required');
  }

  if (!sessionData.tenant) {
    throw new Error('Tenant is required');
  }

  const hasuraClient = getHasuraAdminClient(sessionData.tenant);

  const input = body.input;

  const userId = randomUUID();

  await insertAuthUser(hasuraClient, {
    UserId: userId,
    UserName: input.UserName,
    Email: input.Email,
    CreatedByUser: sessionData.userId,
    OrgKey: sessionData.orgKey,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: userId,
    }),
  };
});
