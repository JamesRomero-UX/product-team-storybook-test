import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { AccessTypeEnum, ParentTypeEnum } from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  await checkPermission(
    request,
    ParentTypeEnum.DepartmentType,
    AccessTypeEnum.Delete,
    request.input.Ids
  );
  const hasuraClient = await getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const { delete_department_type } = await apiClient.deleteDepartmentTypes({
    DepartmentTypeIds: request.input.Ids,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: delete_department_type?.affected_rows,
    }),
  };
});
