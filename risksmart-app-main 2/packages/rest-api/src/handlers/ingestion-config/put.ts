import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';
import { storeSecret } from './storeSecret';

export const handler = backendRouteHandler(PutSchema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);

  let SecretArn: string | undefined;
  if (event.input.object.ApiKey) {
    SecretArn = await storeSecret({
      tenant: sessionData.tenant,
      orgKey: sessionData.orgKey,
      apiKey: event.input.object.ApiKey,
    });
  }

  const { update_ingestion_config_by_pk } =
    await apiClient.updateIngestionConfig({
      Id: event.input.object.Id,
      IngestionConfig: event.input.object.IngestionConfig,
      SecretArn,
    });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: update_ingestion_config_by_pk?.Id,
    }),
  };
});
