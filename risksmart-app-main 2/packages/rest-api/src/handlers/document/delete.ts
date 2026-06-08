import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getSessionData } from 'src/session';

import { AccessTypeEnum, ParentTypeEnum } from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);

  await checkPermission(
    request,
    ParentTypeEnum.Document,
    AccessTypeEnum.Delete,
    request.input.Id
  );

  const result = await apiClient.deleteDocument({ id: request.input.Id });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.delete_document?.affected_rows,
    }),
  };
});
