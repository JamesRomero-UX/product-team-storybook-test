import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { getOrgDetails } from 'src/services/orgUtilities';
import { saveSsoConfiguration } from 'src/services/sso-configuration/ssoConfiguration.service';
import { getSessionData } from 'src/session';

import { postSchema } from './postSchema';

export const handler = backendRouteHandler(postSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const { orgKey, tenant } = sessionData;
  const input = body.input.object;
  const auth0Client = getAuth0ManagementClient();
  const { OrgName } = await getOrgDetails({ orgKey, tenant });

  const result = await saveSsoConfiguration({
    input,
    auth0Client,
    sessionData,
    orgKey,
    orgName: OrgName,
  });

  const statusCode = result.Action === 'created' ? 201 : 200;

  return {
    statusCode,
    body: JSON.stringify(result),
  };
});
