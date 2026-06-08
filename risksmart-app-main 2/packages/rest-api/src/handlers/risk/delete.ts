import { getSessionData } from 'src/session';

import { AccessTypeEnum, ParentTypeEnum } from '../../../generated/graphql';
import { workflows } from '../../approval-workflows/workflows';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  await checkPermission(
    request,
    ParentTypeEnum.Risk,
    AccessTypeEnum.Delete,
    request.input.Id
  );

  await workflows['delete-risk'](sessionData.tenant).execute(request)({
    id: request.input.Id,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: 1,
    }),
  };
});
