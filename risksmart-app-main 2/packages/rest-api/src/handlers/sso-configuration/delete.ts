import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { deleteSsoConfiguration } from 'src/services/sso-configuration/ssoConfiguration.service';
import { getSessionData } from 'src/session';

import { deleteSchema } from './deleteSchema';

export const handler = backendRouteHandler(deleteSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const { orgKey } = sessionData;
  const auth0Client = getAuth0ManagementClient();

  const result = await deleteSsoConfiguration({
    auth0Client,
    sessionData,
    orgKey,
    clientId: body.input.object.clientId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});
