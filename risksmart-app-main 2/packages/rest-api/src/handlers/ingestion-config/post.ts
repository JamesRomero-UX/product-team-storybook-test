import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';
import { storeSecret } from './storeSecret';

export const handler = backendRouteHandler(PostSchema, async (event) => {
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

  const { insert_ingestion_config_one } = await apiClient.insertIngestionConfig(
    {
      IngestionConfig: event.input.object.IngestionConfig,
      SecretArn,
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: insert_ingestion_config_one?.Id,
    }),
  };
});
