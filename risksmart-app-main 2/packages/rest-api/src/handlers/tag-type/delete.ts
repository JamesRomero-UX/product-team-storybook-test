import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { AccessTypeEnum, ParentTypeEnum } from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  await checkPermission(
    request,
    ParentTypeEnum.TagType,
    AccessTypeEnum.Delete,
    request.input.Ids
  );
  const hasuraClient = await getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { delete_tag_type } = await apiClient.deleteTagTypes({
    TagTypeIds: request.input.Ids,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: delete_tag_type?.affected_rows,
    }),
  };
});
