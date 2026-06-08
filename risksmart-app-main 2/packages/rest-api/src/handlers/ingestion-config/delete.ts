import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getSessionData } from 'src/session';

import { deleteSecret } from './deleteSecret';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);

  const { ingestion_config_by_pk: existing } =
    await apiClient.getIngestionConfigById({
      Id: event.input.object.Id,
    });

  if (existing?.SecretArn) {
    await deleteSecret(existing.SecretArn);
  }

  const { delete_ingestion_config_by_pk } =
    await apiClient.deleteIngestionConfig({
      Id: event.input.object.Id,
    });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: delete_ingestion_config_by_pk?.Id,
    }),
  };
});
